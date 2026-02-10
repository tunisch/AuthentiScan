# Video Verification Contract - Build and Test Script (Windows)
# This script builds and tests the Soroban smart contract

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Video Verification Contract Build Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Rust is installed
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Cargo (Rust) is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Rust from: https://rustup.rs/" -ForegroundColor Yellow
    Write-Host "Download and run: https://win.rustup.rs/x86_64" -ForegroundColor Yellow
    exit 1
}

# Check if Stellar CLI is installed
if (-not (Get-Command stellar -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Warning: Stellar CLI is not installed" -ForegroundColor Yellow
    Write-Host "Install with: cargo install --locked stellar-cli --features opt" -ForegroundColor Yellow
    Write-Host ""
}

# Add wasm32 target if not present
Write-Host "📦 Adding wasm32-unknown-unknown target..." -ForegroundColor Cyan
rustup target add wasm32-unknown-unknown

# Navigate to contract directory
Set-Location -Path "soroban-contract" -ErrorAction Stop

Write-Host ""
Write-Host "🧪 Running unit tests..." -ForegroundColor Cyan
Write-Host "------------------------"
cargo test

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Tests failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔨 Building contract..." -ForegroundColor Cyan
Write-Host "------------------------"
cargo build --target wasm32-unknown-unknown --release

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "WASM file location:" -ForegroundColor Yellow
    Write-Host "  target/wasm32-unknown-unknown/release/video_verification.wasm"
} else {
    Write-Host ""
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Optimize if stellar CLI is available
if (Get-Command stellar -ErrorAction SilentlyContinue) {
    Write-Host ""
    Write-Host "⚙️  Optimizing WASM..." -ForegroundColor Cyan
    Write-Host "------------------------"
    stellar contract optimize --wasm target/wasm32-unknown-unknown/release/video_verification.wasm
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Optimization complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Optimized WASM:" -ForegroundColor Yellow
        Write-Host "  target/wasm32-unknown-unknown/release/video_verification.optimized.wasm"
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ Contract ready for deployment!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure Stellar CLI for testnet"
Write-Host "  2. Fund your deployer account"
Write-Host "  3. Deploy with: stellar contract deploy --wasm <path> --network testnet"
Write-Host ""
