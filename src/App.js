import { useEffect, useState, useCallback } from 'react'
import logo from './images/gg.png'
import Main from './pages/Main'
import Admin from './pages/Admin'
import Proposal from './pages/Proposal'
import './App.css';
import { WalletWrapper } from './components/WalletWrapper'
import { WalletButton } from './components/WalletButton'
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from 'react-hot-toast'

const App = () => {
  /* Wallet state */
  const [walletAddress, setWallet] = useState("")
  const [status, setStatus] = useState("")
  const [balance, setBalance] = useState(0)
  const [chainId, setChainId] = useState(0)
  const [votes, setVotes] = useState(0)
  const walletProps = {
      setStatus,
      status,
      setWallet,
      walletAddress,
      setBalance,
      balance,
      setChainId,
      chainId,
      setVotes,
      votes
  }

  const getVotes = useCallback(async () => {
    const goatBalance = balance.goatBalance
    const stakedGoatBalance = balance.stakedGoatBalance
    let curve = 1
    let goatVotes = 0
    for (let i = 1; i <= goatBalance; i++) {
        goatVotes += 1/i**curve
    }
    let stakedGoatVotes = 0
    for (let i = 1; i <= stakedGoatBalance; i++) {
        stakedGoatVotes += (1/i**curve) * 1.1
    }
    setVotes((goatVotes + stakedGoatVotes).toFixed(2))
  }, [balance.goatBalance, balance.stakedGoatBalance])

  useEffect(() => { 
    getVotes()
  }, [balance, getVotes])

  const routes = <Routes>
                  <Route path='/' element={<Main {...walletProps} />} />
                  <Route path='/admin' element={<Admin {...walletProps} />} />
                  <Route path='/proposal/:id' element={<Proposal {...walletProps} />} />
                  <Route path='*' element={<Navigate to='' />} />
              </Routes>
  return (
    <div className="App">
      <Toaster />
      <WalletWrapper
        {...walletProps}
        getVotes={getVotes}
      >
        <div id="header">
          <WalletButton {...walletProps} />
          <div id="voting">Your voting power: {votes}</div>
          
        </div>
        <div id="content">
          <a href="/"><img src={logo} className="App-logo" alt="logo" /></a>
          <Router>
            {routes}
          </Router>
        </div>
      </WalletWrapper>
    </div>
  );
}

export default App;
