'use client';

// Freighter cüzdan bağlantı bileşeni — gerçek entegrasyon
// Freighter wallet connection component — real integration

import { useWallet } from '@/lib/useWallet';

export default function WalletConnect() {
    const { isConnected, address, network, isLoading, error, connect, disconnect } = useWallet();

    // Bağlı değilse bağlan butonu göster
    if (!isConnected) {
        return (
            <div className="border-2 border-black p-4 bg-white">
                <div className="flex items-center justify-between">
                    <p className="font-mono">Wallet: Not Connected</p>
                    <button
                        onClick={connect}
                        disabled={isLoading}
                        className="border-2 border-black px-4 py-1 font-bold hover:bg-gray-100 disabled:opacity-50"
                    >
                        {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                </div>
                {error && <p className="text-red-600 text-sm mt-2 font-mono">{error}</p>}
            </div>
        );
    }

    // Bağlıysa adresi ve ağı göster
    return (
        <div className="border-2 border-black p-4 bg-white">
            <div className="flex items-center justify-between">
                <div className="font-mono text-sm">
                    <p>Wallet: <span className="text-green-700">Connected</span></p>
                    <p className="text-xs mt-1">{address?.slice(0, 8)}...{address?.slice(-8)}</p>
                    {network && <p className="text-xs text-gray-500">Network: {network}</p>}
                </div>
                <button
                    onClick={disconnect}
                    className="border-2 border-black px-4 py-1 font-bold hover:bg-gray-100 text-sm"
                >
                    Disconnect
                </button>
            </div>
        </div>
    );
}
