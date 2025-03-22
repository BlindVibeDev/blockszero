import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { TokenProvider } from './context/TokenContext';
import { CryptoProvider } from './context/CryptoContext';
import { PortfolioProvider } from './context/PortfolioContext';
import MainApp from './components/MainApp';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertProvider>
          <TokenProvider>
            <CryptoProvider>
              <PortfolioProvider>
                <MainApp />
              </PortfolioProvider>
            </CryptoProvider>
          </TokenProvider>
        </AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;