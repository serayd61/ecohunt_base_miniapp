'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import sdk from '@farcaster/frame-sdk';

// Context type from SDK
type FrameContextType = Awaited<typeof sdk.context>;

interface FarcasterContextType {
  context: FrameContextType | null;
  isSDKLoaded: boolean;
  isInFrame: boolean;
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

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Get frame context
        const frameContext = await sdk.context;
        
        if (frameContext) {
          setContext(frameContext);
          setIsInFrame(true);
          
          // Signal that the app is ready
          sdk.actions.ready();
        }
      } catch (error) {
        console.log('Not running in Farcaster frame context');
      } finally {
        setIsSDKLoaded(true);
      }
    };

    initializeSDK();
  }, []);

  // Get user's Ethereum address from context
  const verifiedAddresses = (context?.user as any)?.verifiedAddresses?.ethAddresses || [];
  const custodyAddress = (context?.user as any)?.custodyAddress || null;

  const user = {
    fid: context?.user?.fid ?? null,
    username: context?.user?.username ?? null,
    displayName: context?.user?.displayName ?? null,
    pfpUrl: context?.user?.pfpUrl ?? null,
    custodyAddress,
    verifiedAddresses,
  };

  return (
    <FarcasterContext.Provider value={{ context, isSDKLoaded, isInFrame, user }}>
      {children}
    </FarcasterContext.Provider>
  );
}

