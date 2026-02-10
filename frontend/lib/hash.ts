/**
 * SHA-256 Hash Utility for Video Files
 * 
 * Bu modül video dosyalarının SHA-256 hash'ini hesaplar.
 * This module calculates SHA-256 hash of video files.
 * 
 * Hash, blockchain'de video benzersizliğini sağlamak için kullanılır.
 * Hash is used to ensure video uniqueness on the blockchain.
 */

/**
 * Video dosyasının SHA-256 hash'ini hesapla
 * Calculate SHA-256 hash of a video file
 * 
 * @param file - Video dosyası / Video file
 * @returns Promise<string> - Hex formatında hash / Hash in hex format
 */
export async function calculateVideoHash(file: File): Promise<string> {
    // Dosyayı ArrayBuffer olarak oku
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Web Crypto API kullanarak SHA-256 hash hesapla
    // Calculate SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);

    // ArrayBuffer'ı hex string'e dönüştür
    // Convert ArrayBuffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * Hash'i kısalt (UI'da gösterim için)
 * Truncate hash (for UI display)
 * 
 * @param hash - Tam hash / Full hash
 * @param length - Gösterilecek karakter sayısı / Number of characters to show
 * @returns Kısaltılmış hash / Truncated hash
 */
export function truncateHash(hash: string, length: number = 8): string {
    if (hash.length <= length * 2) return hash;
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * Dosya boyutunu okunabilir formata çevir
 * Convert file size to readable format
 * 
 * @param bytes - Byte cinsinden boyut / Size in bytes
 * @returns Okunabilir format (örn: "2.5 MB") / Readable format (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Video dosyası mı kontrol et
 * Check if file is a video
 * 
 * @param file - Dosya / File
 * @returns boolean - Video ise true / True if video
 */
export function isVideoFile(file: File): boolean {
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/x-msvideo'];
    return videoTypes.includes(file.type);
}
