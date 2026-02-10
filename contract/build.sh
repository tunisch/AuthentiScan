#!/bin/bash

# Video Verification Contract - Build and Test Script
# This script builds and tests the Soroban smart contract

echo "========================================="
echo "Video Verification Contract Build Script"
echo "========================================="
echo ""

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: Cargo (Rust) is not installed"
    echo ""
    echo "Please install Rust from: https://rustup.rs/"
    echo "Run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if Stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "⚠️  Warning: Stellar CLI is not installed"
    echo "Install with: cargo install --locked stellar-cli --features opt"
    echo ""
fi

# Add wasm32 target if not present
echo "📦 Adding wasm32-unknown-unknown target..."
rustup target add wasm32-unknown-unknown

# Navigate to contract directory
cd soroban-contract || exit 1

echo ""
echo "🧪 Running unit tests..."
echo "------------------------"
cargo test

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All tests passed!"
else
    echo ""
    echo "❌ Tests failed"
    exit 1
fi

echo ""
echo "🔨 Building contract..."
echo "------------------------"
cargo build --target wasm32-unknown-unknown --release

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "WASM file location:"
    echo "  target/wasm32-unknown-unknown/release/video_verification.wasm"
else
    echo ""
    echo "❌ Build failed"
    exit 1
fi

# Optimize if stellar CLI is available
if command -v stellar &> /dev/null; then
    echo ""
    echo "⚙️  Optimizing WASM..."
    echo "------------------------"
    stellar contract optimize \
        --wasm target/wasm32-unknown-unknown/release/video_verification.wasm
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Optimization complete!"
        echo ""
        echo "Optimized WASM:"
        echo "  target/wasm32-unknown-unknown/release/video_verification.optimized.wasm"
    fi
fi

echo ""
echo "========================================="
echo "✅ Contract ready for deployment!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Configure Stellar CLI for testnet"
echo "  2. Fund your deployer account"
echo "  3. Deploy with: stellar contract deploy --wasm <path> --network testnet"
echo ""
