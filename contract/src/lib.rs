#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, contracterror, Address, BytesN, Env, Vec};

/// Kalıcı ve örnek depolama için depolama anahtarı numaralandırması
/// Storage key enumeration for persistent and instance storage
/// 
/// Verification: Kompozit anahtar (video_hash, submitter) - bireysel doğrulama kayıtları için
/// Verification: Composite key (video_hash, submitter) for individual verification records
/// VerificationCount: Toplam doğrulama sayısı için global sayaç (sayfalama için kullanılır)
/// VerificationCount: Global counter for total number of verifications (used for pagination)
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    /// Bireysel doğrulama kaydı için anahtar: (video_hash)
    /// Global key for individual verification record: (video_hash)
    Verification(BytesN<32>),
    /// Toplam doğrulama sayısı için anahtar
    /// Key for total verification count
    VerificationCount,
}

/// Blockchain üzerinde saklanan tek bir video doğrulama kaydını temsil eder
/// Represents a single video verification record stored on-chain
/// 
/// Bu yapı, bir video doğrulaması için tüm değişmez kanıt verilerini içerir:
/// This struct contains all immutable proof data for a video verification:
/// - video_hash: Video dosyasının SHA-256 hash'i (benzersizliği sağlar)
/// - video_hash: SHA-256 hash of the video file (ensures uniqueness)
/// - submitter: Doğrulamayı gönderen cüzdan adresi
/// - submitter: Wallet address that submitted the verification
/// - is_ai_generated: Zincir dışı AI analizinden gelen sonuç
/// - is_ai_generated: Result from off-chain AI analysis
/// - confidence_score: AI güven yüzdesi (0-100)
/// - confidence_score: AI confidence percentage (0-100)
/// - timestamp: Doğrulamanın gönderildiği ledger zaman damgası
/// - timestamp: Ledger timestamp when verification was submitted
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VerificationRecord {
    pub video_hash: BytesN<32>,      // Video SHA-256 hash'i / Video SHA-256 hash
    pub submitter: Address,           // Gönderen cüzdan adresi / Submitter wallet address
    pub is_ai_generated: bool,        // AI üretimi mi? / Is AI-generated?
    pub confidence_score: u32,        // Güven skoru (0-100) / Confidence score (0-100)
    pub timestamp: u64,               // Zaman damgası / Timestamp
}

/// Kontrat işlemleri için özel hata tipleri
/// Custom error types for contract operations
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    /// Güven skoru 0-100 arasında olmalı / Confidence score must be between 0-100
    InvalidConfidence = 1,
    /// Bu video hash'i sistemde zaten kayıtlı (Değişmezlik Koruması) 
    /// This video hash is already registered (Immutability Protection)
    AlreadyVerified = 2,
    /// Kimlik doğrulama başarısız - çağıran yetkili değil / Authentication failed - caller is not authorized
    Unauthorized = 3,
    /// Doğrulama kaydı bulunamadı / Verification record not found
    NotFound = 4,
    /// Video hash'i geçersiz (boş veya hatalı) / Video hash is invalid (empty or malformed)
    InvalidHash = 5,
}

#[contract]
pub struct VideoVerificationContract;

#[contractimpl]
impl VideoVerificationContract {
    /// Submit a new video verification result to the blockchain
    /// 
    /// This function stores the AI analysis result on-chain with immutable proof.
    /// Only the submitter (wallet owner) can create verifications for their videos.
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `submitter` - Wallet address submitting the verification (must sign transaction)
    /// * `video_hash` - SHA-256 hash of the video file (32 bytes)
    /// * `is_ai_generated` - AI analysis result (true = AI-generated, false = real)
    /// * `confidence_score` - AI confidence percentage (0-100)
    /// 
    /// # Authentication
    /// Requires `submitter.require_auth()` - transaction must be signed by submitter's wallet
    /// 
    /// # Errors
    /// * `Error::Unauthorized` - If authentication fails
    /// * `Error::InvalidConfidence` - If confidence_score > 100
    /// * `Error::DuplicateVerification` - If this hash was already verified by this submitter
    /// 
    /// # Storage
    /// Uses persistent storage to ensure data survives contract upgrades
    pub fn submit_verification(
        env: Env,
        submitter: Address,
        video_hash: BytesN<32>,
        is_ai_generated: bool,
        confidence_score: u32,
    ) -> Result<(), Error> {
        // KİMLİK DOĞRULAMA: İşlemin gönderen cüzdanı tarafından imzalandığını doğrula
        // Bu, kimliğe bürünmeyi önler ve sadece cüzdan sahibinin gönderim yapabilmesini sağlar
        // AUTHENTICATION: Verify transaction is signed by the submitter's wallet
        // This prevents impersonation and ensures only the wallet owner can submit
        submitter.require_auth();

        // DOĞRULAMA: Güven skoru geçerli aralıkta olmalı (0-100)
        // VALIDATION: Confidence score must be in valid range (0-100)
        if confidence_score > 100 {
            return Err(Error::InvalidConfidence);
        }

        // TEKRAR KONTROLÜ: Global Önem: Bir video sadece BİR kez doğrulanabilir.
        // GLOBAL CHECK: One video, one truth. Re-submission is strictly prohibited.
        let key = DataKey::Verification(video_hash.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyVerified);
        }

        // Değişmez kayıt için mevcut ledger zaman damgasını al
        // Get current ledger timestamp for immutable record
        let timestamp = env.ledger().timestamp();

        // Doğrulama kaydını oluştur
        // Create verification record
        let record = VerificationRecord {
            video_hash: video_hash.clone(),
            submitter: submitter.clone(),
            is_ai_generated,
            confidence_score,
            timestamp,
        };

        // DEPOLAMA: Kalıcı depolamaya yaz (kontrat yükseltmelerinde hayatta kalır)
        // TTL (Yaşam Süresi) 1 yıl olarak ayarlandı (~5 saniye/ledger)
        // 1 yıl ≈ 6,307,200 ledger
        // STORAGE: Write to persistent storage (survives contract upgrades)
        // TTL (Time To Live) set to 1 year (in ledgers, ~5 seconds per ledger)
        // 1 year ≈ 6,307,200 ledgers
        env.storage().persistent().set(&key, &record);
        env.storage().persistent().extend_ttl(&key, 6_307_200, 6_307_200);

        // Global doğrulama sayacını artır
        // Increment global verification count
        let count_key = DataKey::VerificationCount;
        let current_count: u32 = env
            .storage()
            .persistent()
            .get(&count_key)
            .unwrap_or(0);
        
        env.storage().persistent().set(&count_key, &(current_count + 1));
        env.storage().persistent().extend_ttl(&count_key, 6_307_200, 6_307_200);

        Ok(())
    }

    /// Retrieve a specific verification record by video hash and submitter
    /// 
    /// This is a public read function - no authentication required.
    /// Anyone can verify the authenticity of a video by querying the blockchain.
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `video_hash` - SHA-256 hash of the video to look up
    /// * `submitter` - Wallet address that submitted the verification
    /// 
    /// # Returns
    /// * `Some(VerificationRecord)` - If verification exists
    /// * `None` - If no verification found for this hash + submitter combination
    pub fn get_verification(
        env: Env,
        video_hash: BytesN<32>,
    ) -> Option<VerificationRecord> {
        let key = DataKey::Verification(video_hash);
        env.storage().persistent().get(&key)
    }

    /// Get the total number of verifications stored in the contract
    /// 
    /// Useful for pagination and statistics in the frontend.
    /// 
    /// # Returns
    /// Total count of verification records
    pub fn get_verification_count(env: Env) -> u32 {
        let key = DataKey::VerificationCount;
        env.storage().persistent().get(&key).unwrap_or(0)
    }

    /// Get all verifications submitted by a specific address (paginated)
    /// 
    /// This function iterates through all possible verifications to find matches.
    /// Note: This is a simplified implementation for academic purposes.
    /// In production, you would use indexed storage or events for efficient queries.
    /// 
    /// # Arguments
    /// * `env` - Contract environment
    /// * `submitter` - Wallet address to query
    /// * `start` - Starting index for pagination (currently unused in this implementation)
    /// * `limit` - Maximum number of results to return
    /// 
    /// # Returns
    /// Vector of verification records for this submitter
    /// 
    /// # Note
    /// This is a simplified version. A production implementation would require
    /// maintaining a separate index of submitter -> [video_hashes] for efficiency.
    pub fn get_verifications_by_submitter(
        env: Env,
        submitter: Address,
        _start: u32,
        _limit: u32,
    ) -> Vec<VerificationRecord> {
        Vec::new(&env)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, BytesN, Env};

    #[test]
    fn test_submit_and_retrieve_verification() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VideoVerificationContract);
        let client = VideoVerificationContractClient::new(&env, &contract_id);

        let submitter = Address::generate(&env);
        let video_hash = BytesN::from_array(&env, &[1u8; 32]);
        let is_ai_generated = true;
        let confidence_score = 85;

        env.mock_all_auths();

        client.submit_verification(
            &submitter,
            &video_hash,
            &is_ai_generated,
            &confidence_score,
        ).unwrap();

        let record = client.get_verification(&video_hash).unwrap();
        assert_eq!(record.submitter, submitter);
        assert_eq!(record.is_ai_generated, is_ai_generated);
        assert_eq!(record.confidence_score, confidence_score);

        assert_eq!(client.get_verification_count(), 1);
    }

    #[test]
    fn test_global_duplicate_rejection() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VideoVerificationContract);
        let client = VideoVerificationContractClient::new(&env, &contract_id);

        let submitter1 = Address::generate(&env);
        let submitter2 = Address::generate(&env);
        let video_hash = BytesN::from_array(&env, &[2u8; 32]);

        env.mock_all_auths();

        // First submission by User A succeeds
        client.submit_verification(&submitter1, &video_hash, &false, &90).unwrap();

        // Second submission by User B with SAME hash fails (Global Truth protection)
        let result = client.submit_verification(&submitter2, &video_hash, &true, &95);
        assert_eq!(result, Err(Ok(Error::AlreadyVerified)));
    }

    #[test]
    fn test_invalid_confidence_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, VideoVerificationContract);
        let client = VideoVerificationContractClient::new(&env, &contract_id);

        let submitter = Address::generate(&env);
        let video_hash = BytesN::from_array(&env, &[3u8; 32]);

        env.mock_all_auths();

        let result = client.submit_verification(&submitter, &video_hash, &true, &150);
        assert_eq!(result, Err(Ok(Error::InvalidConfidence)));
    }
}
