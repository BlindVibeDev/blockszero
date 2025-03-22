import React, { createContext, useContext, useState } from 'react';
import { CoinSearchResult } from '../services/cryptoApi';

interface TokenContextType {
  selectedToken: CoinSearchResult | null;
  tokenDetails: any | null;
  setSelectedToken: (token: CoinSearchResult | null) => void;
  setTokenDetails: (details: any | null) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<CoinSearchResult | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);

  return (
    <TokenContext.Provider value={{
      selectedToken,
      tokenDetails,
      setSelectedToken,
      setTokenDetails
    }}>
      {children}
    </TokenContext.Provider>
  );
};