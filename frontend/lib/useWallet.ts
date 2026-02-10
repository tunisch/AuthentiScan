// Freighter wallet hook
// Freighter cüzdan bağlantı hook'u

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    isConnected as freighterIsConnected,
    requestAccess,
    getAddress,
    signTransaction,
    getNetwork,
} from '@stellar/freighter-api';

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    network: string | null;
    isLoading: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    sign: (txXdr: string, opts: { networkPassphrase: string }) => Promise<string>;
}

export function useWallet(): WalletState {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState<string | null>(null);
    const [network, setNetwork] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sayfa yüklendiğinde daha önce bağlı mıydı kontrol et
    // Check if wallet was previously connected on page load
    useEffect(() => {
        (async () => {
            try {
                const connected = await freighterIsConnected();
                if (connected.isConnected) {
                    const addrResult = await getAddress();
                    if (addrResult.address) {
                        setAddress(addrResult.address);
                        setIsConnected(true);
                        const netResult = await getNetwork();
                        setNetwork(netResult.network || null);
                    }
                }
            } catch {
                // Freighter yüklü değil — sessizce geç
                // Freighter not installed — silently skip
            }
        })();
    }, []);

    // Cüzdanı bağla / Connect wallet
    const connect = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Freighter yüklü mü kontrol et
            const connected = await freighterIsConnected();
            if (!connected.isConnected) {
                throw new Error('Freighter wallet not detected. Please install Freighter extension.');
            }

            // 2. Erişim izni iste / Request access
            const accessResult = await requestAccess();
            if (accessResult.error) {
                throw new Error(`Access denied: ${accessResult.error}`);
            }

            // 3. Adresi al / Get address
            const addrResult = await getAddress();
            if (!addrResult.address) {
                throw new Error('Could not get wallet address');
            }

            // 4. Ağ bilgisini al ve testnet doğrula
            //    Get network info and validate testnet
            const netResult = await getNetwork();
            setNetwork(netResult.network || null);

            if (netResult.network && netResult.network !== 'TESTNET') {
                console.warn('⚠️ Wallet is not on TESTNET. Current:', netResult.network);
            }

            setAddress(addrResult.address);
            setIsConnected(true);
            console.log('✅ Wallet connected:', addrResult.address);
        } catch (err: any) {
            console.error('Wallet connection error:', err);
            setError(err.message || 'Failed to connect wallet');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Bağlantıyı kes / Disconnect
    const disconnect = useCallback(() => {
        setAddress(null);
        setIsConnected(false);
        setNetwork(null);
        setError(null);
    }, []);

    // Transaction imzalama / Sign transaction
    const sign = useCallback(
        async (txXdr: string, opts: { networkPassphrase: string }): Promise<string> => {
            const result = await signTransaction(txXdr, {
                networkPassphrase: opts.networkPassphrase,
                address: address || undefined,
            });
            if (result.signedTxXdr) {
                return result.signedTxXdr;
            }
            throw new Error(result.error || 'Signing failed');
        },
        [address],
    );

    return { isConnected, address, network, isLoading, error, connect, disconnect, sign };
}
