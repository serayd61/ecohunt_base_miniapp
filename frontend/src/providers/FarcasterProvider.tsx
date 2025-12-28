'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';

// Context type from SDK
type FrameContextType = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  context: FrameContextType | null;
  isSDKLoaded: boolean;
  isInFrame: boolean;
  connectedAddress: string | null;
  user: {
    fid: number | null;
    username: string | null;
    displayName: string | null;
    pfpUrl: string | null;
    custodyAddress: string | null;
    verifiedAddresses: string[];
  };
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: null,
  isSDKLoaded: false,
  isInFrame: false,
  connectedAddress: null,
  user: {
    fid: null,
    username: null,
    displayName: null,
    pfpUrl: null,
    custodyAddress: null,
    verifiedAddresses: [],
  },
});

export function useFarcaster() {
  return useContext(FarcasterContext);
}

export function FarcasterProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FrameContextType | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isInFrame, setIsInFrame] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Get frame context
        const frameContext = await sdk.context;
        
        console.log('Farcaster Frame Context:', JSON.stringify(frameContext, null, 2));
        
        if (frameContext) {
          setContext(frameContext);
          setIsInFrame(true);
          
          // Signal that the app is ready
          sdk.actions.ready();
          
          // Try to get Ethereum provider and connected address
          try {
            const ethProvider = sdk.wallet.ethProvider;
            if (ethProvider) {
              const accounts = await ethProvider.request({ method: 'eth_requestAccounts' }) as string[];
              console.log('Connected Ethereum accounts:', accounts);
              if (accounts && accounts.length > 0) {
                setConnectedAddress(accounts[0]);
              }
            }
          } catch (walletError) {
            console.log('Could not get wallet address:', walletError);
          }
        }
      } catch (error) {
        console.log('Not running in Farcaster frame context:', error);
      } finally {
        setIsSDKLoaded(true);
      }
    };

    initializeSDK();
  }, []);

  // Get user's Ethereum address from context - try multiple paths
  const contextAny = context as any;
  const verifiedAddresses = 
    contextAny?.user?.verifiedAddresses?.ethAddresses ||
    contextAny?.user?.verified_addresses?.eth_addresses ||
    [];
  const custodyAddress = 
    contextAny?.user?.custodyAddress ||
    contextAny?.user?.custody_address ||
    null;

  const user = {
    fid: context?.user?.fid ?? null,
    username: context?.user?.username ?? null,
    displayName: context?.user?.displayName ?? null,
    pfpUrl: context?.user?.pfpUrl ?? null,
    custodyAddress,
    verifiedAddresses,
  };

  return (
    <FarcasterContext.Provider value={{ context, isSDKLoaded, isInFrame, connectedAddress, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}

