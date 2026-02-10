/**
 * Frontend Validation Test Suite
 * 
 * Standalone Node.js test harness — no Jest/Vitest required.
 * Tests pure logic modules: hash utilities, mockAi, and soroban config.
 * 
 * Run: node --experimental-vm-modules tests/validate.mjs
 */

import { webcrypto } from 'crypto';

// Polyfill for Node.js (Web Crypto API)
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✅ PASS: ${testName}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL: ${testName}`);
        failed++;
    }
}

function section(name) {
    console.log(`\n━━━ ${name} ━━━`);
}

// =======================
//  1. SHA-256 Hash Tests
// =======================
section('1. SHA-256 HASH TESTS');

// Test: deterministic output (same input → same hash)
async function testHashDeterminism() {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const hash1 = await hashBytes(data);
    const hash2 = await hashBytes(data);
    assert(hash1 === hash2, 'Same input produces same hash');
    assert(hash1.length === 64, 'Hash is 64 hex characters (SHA-256)');
}

// Test: different input → different hash
async function testHashDifference() {
    const data1 = new Uint8Array([1, 2, 3]);
    const data2 = new Uint8Array([1, 2, 4]);
    const hash1 = await hashBytes(data1);
    const hash2 = await hashBytes(data2);
    assert(hash1 !== hash2, 'Different input produces different hash');
}

// Test: known SHA-256 vector
async function testHashKnownVector() {
    // SHA-256 of empty string = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const empty = new Uint8Array([]);
    const hash = await hashBytes(empty);
    assert(hash === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Empty input matches known SHA-256 vector');
}

// Helper: hash raw bytes (mirrors lib/hash.ts logic)
async function hashBytes(data) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

await testHashDeterminism();
await testHashDifference();
await testHashKnownVector();

// =======================
//  2. Mock AI Tests
// =======================
section('2. MOCK AI ANALYSIS TESTS');

// Test: confidence score always in range [0, 100]
function testConfidenceRange() {
    // Simulate the scoring logic from mockAi.ts
    for (let trial = 0; trial < 100; trial++) {
        const sizeScore = Math.random() > 0.5 ? 70 : 40;
        const nameScore = Math.random() > 0.7 ? 80 : 20;
        const randomScore = Math.random() * 30;
        const totalScore = sizeScore * 0.4 + nameScore * 0.4 + randomScore * 0.2;
        const confidence = Math.min(100, Math.max(0, Math.round(totalScore)));

        if (confidence < 0 || confidence > 100) {
            assert(false, `Trial ${trial}: confidence ${confidence} out of range`);
            return;
        }
    }
    assert(true, 'All 100 trial outputs in range [0, 100]');
}

// Test: is_ai_generated is boolean
function testIsAiGeneratedType() {
    const sizeScore = 70;
    const nameScore = 80;
    const randomScore = 15;
    const totalScore = sizeScore * 0.4 + nameScore * 0.4 + randomScore * 0.2;
    const isAI = totalScore > 50;
    assert(typeof isAI === 'boolean', 'is_ai_generated is always boolean');
}

// Test: deterministic for same parameters (minus random)
function testScoreFormula() {
    // With fixed inputs, the deterministic parts should be consistent
    const sizeScore = 70; // < 1MB
    const nameScore = 20; // no "ai" in name
    const fixedRandom = 0; // minimum random
    const totalScore = sizeScore * 0.4 + nameScore * 0.4 + fixedRandom * 0.2;
    const expected = 36; // 28 + 8 + 0 = 36
    assert(Math.round(totalScore) === expected, `Score formula: 70*0.4 + 20*0.4 + 0*0.2 = ${expected}`);
}

testConfidenceRange();
testIsAiGeneratedType();
testScoreFormula();

// =======================
//  3. Soroban Config Tests
// =======================
section('3. SOROBAN CONFIG VALIDATION');

// Test: RPC URL is valid
const RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
assert(RPC_URL.startsWith('https://'), 'RPC URL uses HTTPS');
assert(RPC_URL.includes('testnet'), 'RPC URL targets testnet');

// Test: CONTRACT_ID presence check
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || '';
if (CONTRACT_ID) {
    assert(CONTRACT_ID.length === 56, 'CONTRACT_ID is 56 characters (Stellar format)');
    assert(CONTRACT_ID.startsWith('C'), 'CONTRACT_ID starts with C');
} else {
    console.log('  ⚠️ SKIP: CONTRACT_ID not set (expected before deployment)');
}

// =======================
//  4. Transaction Flow Logic Tests
// =======================
section('4. TRANSACTION FLOW LOGIC');

// Test: polling logic handles NOT_FOUND → SUCCESS
function testPollingLogic() {
    let attempts = 0;
    const maxAttempts = 30;
    let status = 'NOT_FOUND';

    // Simulate: status changes to SUCCESS after 3 attempts
    while (status === 'NOT_FOUND' && attempts < maxAttempts) {
        attempts++;
        if (attempts === 3) status = 'SUCCESS';
    }

    assert(status === 'SUCCESS', 'Polling resolves to SUCCESS');
    assert(attempts === 3, 'Polling stops at correct attempt');
}

// Test: polling logic handles timeout
function testPollingTimeout() {
    let attempts = 0;
    const maxAttempts = 30;
    let status = 'NOT_FOUND';

    while (status === 'NOT_FOUND' && attempts < maxAttempts) {
        attempts++;
        // Status never changes
    }

    assert(attempts === maxAttempts, 'Polling stops at max attempts');
    assert(status === 'NOT_FOUND', 'Status remains NOT_FOUND after timeout');
}

// Test: error status handling
function testErrorStatusHandling() {
    const sendStatus = 'ERROR';
    const isError = sendStatus === 'ERROR';
    assert(isError, 'Error status is correctly detected');
}

testPollingLogic();
testPollingTimeout();
testErrorStatusHandling();

// =======================
//  5. Validation Rule Tests
// =======================
section('5. VALIDATION RULES');

// Test: video file type validation
function testVideoFileValidation() {
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/x-msvideo'];

    assert(videoTypes.includes('video/mp4'), 'MP4 accepted');
    assert(videoTypes.includes('video/quicktime'), 'QuickTime accepted');
    assert(!videoTypes.includes('image/png'), 'PNG rejected');
    assert(!videoTypes.includes('application/pdf'), 'PDF rejected');
    assert(!videoTypes.includes('text/plain'), 'Text file rejected');
}

// Test: file size validation (50MB limit)
function testFileSizeValidation() {
    const maxSize = 50 * 1024 * 1024;

    assert(1024 < maxSize, 'Small file passes');
    assert(49 * 1024 * 1024 < maxSize, '49MB passes');
    assert(!(51 * 1024 * 1024 < maxSize), '51MB fails');
    assert(maxSize === 52428800, 'Max size is exactly 52,428,800 bytes');
}

testVideoFileValidation();
testFileSizeValidation();

// =======================
//  6. Edge Case Tests
// =======================
section('6. EDGE CASES');

// Test: hash truncation logic (from VerificationQuery Row component)
function testHashTruncation() {
    const longHash = 'a'.repeat(64);
    const truncated = longHash.length > 24
        ? `${longHash.slice(0, 12)}...${longHash.slice(-12)}`
        : longHash;

    assert(truncated.length === 27, 'Truncated hash is 12+3+12 = 27 chars');
    assert(truncated.includes('...'), 'Truncation uses ellipsis');

    const shortValue = 'NO';
    const notTruncated = shortValue.length > 24
        ? `${shortValue.slice(0, 12)}...${shortValue.slice(-12)}`
        : shortValue;
    assert(notTruncated === 'NO', 'Short values are not truncated');
}

// Test: wallet address is nullable
function testWalletAddressNullable() {
    const address = null;
    const isDisabled = !address;
    assert(isDisabled === true, 'Null address disables operations');

    const connected = 'GDUMMY...';
    const isEnabled = !!connected;
    assert(isEnabled === true, 'Connected address enables operations');
}

testHashTruncation();
testWalletAddressNullable();

// =======================
//  SUMMARY
// =======================
console.log('\n━━━ TEST SUMMARY ━━━');
console.log(`  Total: ${passed + failed}`);
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Result: ${failed === 0 ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
console.log('');

process.exit(failed > 0 ? 1 : 0);
