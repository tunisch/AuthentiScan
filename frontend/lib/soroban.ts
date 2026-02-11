// Stellar / Soroban contract interaction layer
// Soroban kontrat etkileşim katmanı

import {
    Contract,
    Networks,
    TransactionBuilder,
    rpc,
    xdr,
    nativeToScVal,
    scValToNative,
    Address,
} from '@stellar/stellar-sdk';

// Decoded verification record type
export interface VerificationRecord {
    record_id: number;
    video_hash: string;
    submitter: string;
    is_ai_generated: boolean;
    confidence_score: number;
    timestamp: number;
}

// --- Config ---
const NETWORK_PASSPHRASE = Networks.TESTNET;
const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';

export const server = new rpc.Server(SOROBAN_RPC_URL);

// --- Helpers ---

/**
 * Hex string'i BytesN<32> ScVal'e dönüştür
 * Convert hex string to BytesN<32> ScVal
 */
function hashToScVal(hexHash: string): xdr.ScVal {
    const bytes = Buffer.from(hexHash, 'hex');
    return xdr.ScVal.scvBytes(bytes);
}

/**
 * ScVal struct'ını JS nesnesine dönüştür
 * Decode ScVal struct to JS VerificationRecord
 */
function decodeVerificationRecord(scVal: xdr.ScVal): VerificationRecord | null {
    try {
        const native = scValToNative(scVal);

        // scValToNative returns a Map or object depending on the struct
        // Handle both cases
        if (native && typeof native === 'object') {
            return {
                record_id: Number(native.record_id || 0),
                video_hash: native.video_hash
                    ? Buffer.from(native.video_hash).toString('hex')
                    : '',
                submitter: native.submitter?.toString() || '',
                is_ai_generated: Boolean(native.is_ai_generated),
                confidence_score: Number(native.confidence_score),
                timestamp: Number(native.timestamp),
            };
        }

        return null;
    } catch (err) {
        console.error('Failed to decode VerificationRecord:', err);
        return null;
    }
}


// ============================
//  WRITE: submit_verification
// ============================

/**
 * submit_verification kontrat çağrısı için transaction oluştur ve gönder
 * Build and submit transaction for submit_verification contract call
 */
export async function submitVerification(
    walletAddress: string,
    videoHash: string,
    isAiGenerated: boolean,
    confidenceScore: number,
    signTransaction: (txXdr: string, opts: { networkPassphrase: string }) => Promise<string>,
): Promise<{ txHash: string; recordId?: number }> {

    if (!CONTRACT_ID) {
        throw new Error('CONTRACT_ID is not set. Add NEXT_PUBLIC_CONTRACT_ID to .env.local');
    }

    // 1. Hesap bilgisini al / Get account info
    const account = await server.getAccount(walletAddress);

    // 2. Kontrat referansı oluştur / Create contract reference
    const contract = new Contract(CONTRACT_ID);

    // 3. Parametreleri ScVal'e dönüştür / Convert parameters to ScVal
    const submitterScVal = new Address(walletAddress).toScVal();
    const videoHashScVal = hashToScVal(videoHash);
    const isAiScVal = nativeToScVal(isAiGenerated, { type: 'bool' });
    const confidenceScVal = nativeToScVal(confidenceScore, { type: 'u32' });

    // 4. Transaction oluştur / Build transaction
    const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(
            contract.call(
                'submit_verification',
                submitterScVal,
                videoHashScVal,
                isAiScVal,
                confidenceScVal,
            ),
        )
        .setTimeout(30)
        .build();

    // 5. Simulate — gas ve resource tahmini
    const simulated = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simulated)) {
        console.error('Simulation error:', simulated);
        throw new Error(`Simulation failed: ${(simulated as any).error}`);
    }

    // 6. Simülasyon sonuçlarıyla transaction'ı hazırla
    const preparedTx = await server.prepareTransaction(tx);
    // 7. Freighter ile imzalat / Sign with Freighter
    const signedXdr = await signTransaction(preparedTx.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE,
    });

    // 8. İmzalı transaction'ı parse et / Parse signed transaction
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

    // 9. Ağa gönder / Submit to network
    const sendResponse = await server.sendTransaction(signedTx);
    console.log('sendTransaction response:', sendResponse);

    if (sendResponse.status === 'ERROR') {
        throw new Error(`Transaction submission failed: ${sendResponse.status}`);
    }

    // 10. Onay bekle / Wait for confirmation
    const txHash = sendResponse.hash;
    let getResponse = await server.getTransaction(txHash);

    const maxAttempts = 30;
    let attempts = 0;
    while (getResponse.status === 'NOT_FOUND' && attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000));
        getResponse = await server.getTransaction(txHash);
        attempts++;
    }

    if (getResponse.status === 'SUCCESS') {
        console.log('✅ Transaction confirmed:', txHash);

        // Extract return value (record_id) if available
        let recordId: number | undefined;
        try {
            const txResult = getResponse as any;
            if (txResult.returnValue) {
                recordId = scValToNative(txResult.returnValue);
            }
        } catch (e) {
            console.warn('Could not extract recordId from tx result:', e);
        }

        return { txHash, recordId };
    } else {
        console.error('Transaction failed:', getResponse);
        throw new Error(`Transaction failed with status: ${getResponse.status}`);
    }
}


// ============================
//  READ: get_verification
// ============================

/**
 * get_verification — okuma çağrısı (ücretsiz, imza gerekmez)
 * get_verification — read-only call (free, no signing required)
 */
export async function getVerification(
    videoHash: string,
    callerAddress: string, // Needed for RPC simulation fee payers
): Promise<VerificationRecord | null> {

    if (!CONTRACT_ID) {
        throw new Error('CONTRACT_ID is not set.');
    }

    const contract = new Contract(CONTRACT_ID);
    const account = await server.getAccount(callerAddress);

    const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(
            contract.call(
                'get_verification',
                hashToScVal(videoHash),
            ),
        )
        .setTimeout(30)
        .build();

    const simulated = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simulated)) {
        // Simulation error — record probably doesn't exist
        console.log('get_verification simulation error (likely not found)');
        return null;
    }

    // Simülasyon sonucundan dönüş değerini çıkar
    // Extract return value from simulation result
    const successResult = simulated as rpc.Api.SimulateTransactionSuccessResponse;
    const retval = successResult.result?.retval;

    if (!retval) {
        return null;
    }

    // Contract returns Option<VerificationRecord>
    // scvVoid = None, scvMap = Some(record)
    if (retval.switch().name === 'scvVoid') {
        return null;
    }

    return decodeVerificationRecord(retval);
}


// ============================
//  READ: get_verification_count
// ============================

/**
 * get_verification_count — toplam doğrulama sayısını oku
 * get_verification_count — read total verification count
 */
export async function getVerificationCount(
    callerAddress: string,
): Promise<number> {

    if (!CONTRACT_ID) {
        throw new Error('CONTRACT_ID is not set.');
    }

    const contract = new Contract(CONTRACT_ID);
    const account = await server.getAccount(callerAddress);

    const tx = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: NETWORK_PASSPHRASE,
    })
        .addOperation(contract.call('get_verification_count'))
        .setTimeout(30)
        .build();

    const simulated = await server.simulateTransaction(tx);

    if (rpc.Api.isSimulationError(simulated)) {
        console.error('get_verification_count simulation error:', simulated);
        return 0;
    }

    const successResult = simulated as rpc.Api.SimulateTransactionSuccessResponse;
    const retval = successResult.result?.retval;

    if (!retval) return 0;

    return scValToNative(retval) as number;
}
/**
 * Fetch the latest 'submit' events from the contract
 * Acts as a real-time listener for the frontend
 */
export async function getLatestEvents() {
    if (!CONTRACT_ID) return [];

    try {
        const latestLedgerResponse = await server.getLatestLedger();
        // Look back ~2000 ledgers (~3 hours) to find recent activity
        const startLedger = Math.max(0, latestLedgerResponse.sequence - 2000);

        const response = await server.getEvents({
            startLedger,
            filters: [
                {
                    type: 'contract',
                    contractIds: [CONTRACT_ID],
                    topics: [
                        [xdr.ScVal.scvSymbol('submit').toXDR('base64')]
                    ]
                }
            ],
            limit: 10
        });

        return response.events.map(event => {
            const body = xdr.ScVal.fromXDR(event.value as unknown as string, 'base64');
            const data = scValToNative(body);
            return {
                id: event.id,
                ledger: event.ledger,
                recordId: Number(data[0]),
                videoHash: Buffer.from(data[1]).toString('hex'),
                submitter: data[2].toString()
            };
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}
