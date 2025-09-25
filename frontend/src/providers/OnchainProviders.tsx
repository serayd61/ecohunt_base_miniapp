'use client';

import { ReactNode } from 'react';
import { http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig } from 'wagmi';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    coinbaseWallet({
      appName: 'EcoHunt',
      preference: 'smartWalletOnly'
    }),
    metaMask()
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
});

interface WagmiProvidersProps {
  children: ReactNode;
}

export function OnchainProviders({ children }: WagmiProvidersProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}