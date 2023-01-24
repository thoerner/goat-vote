import { useEffect, useState } from 'react';
import logo from './images/gg.png';
import Main from './pages/Main'
import './App.css';
import { WalletWrapper } from './components/WalletWrapper'
import { WalletButton } from './components/WalletButton'
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"

const App = () => {
  /* Wallet state */
  const [walletAddress, setWallet] = useState("")
  const [status, setStatus] = useState("")
  const [balance, setBalance] = useState(0)
  const [chainId, setChainId] = useState(0)
  const walletProps = {
      setStatus,
      status,
      setWallet,
      walletAddress,
      setBalance,
      balance,
      setChainId,
      chainId
  }

  const routes = <Routes>
                  <Route path='/' element={<Main {...walletProps} />} />
                  <Route path='*' element={<Navigate to='' />} />
              </Routes>
  return (
    <div className="App">
      <WalletWrapper
        {...walletProps}
      >
        <div id="header">
          <WalletButton {...walletProps} />
        </div>
        <div id="content">
          <img src={logo} className="App-logo" alt="logo" />
          <Router>
            {routes}
          </Router>
        </div>
      </WalletWrapper>
    </div>
  );
}

export default App;
