import { useEffect } from 'react'

import {
  getCurrentWalletConnected,
  getBalance,
} from '../utils/interact'
import {
  STATUS_READY,
  STATUS_NOT_READY,
  STATUS_NO_MASK
} from '../utils/constants'

/**
 * @notice This component will wrap the entire app and will provide the app with the user's wallet address and status.
 */ 

export const WalletWrapper = ({ getVotes, setWallet, setStatus, setChainId, setBalance, children }) => {

  /** 
   * @dev This function will run when the component is first loaded.
   * It will check if the user has a wallet connected and will set the wallet address and status in the React state.
   * If the user does not have a wallet connected it will just set the wallet status in the React state.
   * This function will also add an event listener that will listen for any changes to the user's wallet.
   * If the user changes their wallet this event listener will update the wallet address and status in the React state.
   */
  useEffect(() => {
    const addWalletListener = () => {
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length > 0) {
            setWallet(accounts[0].toLowerCase())
            setStatus(STATUS_READY)
            getData()
          } else {
            setWallet("")
            setStatus(STATUS_NOT_READY)
          }
          getVotes()
        })
        window.ethereum.on("chainChanged", (_chainId) => {
          setChainId(_chainId)
          getVotes()
        })
      } else {
        setStatus(STATUS_NO_MASK)
      }
    }
    const getData = async () => {
      const { address, status, chainId } = await getCurrentWalletConnected()
      setWallet(address.toLowerCase())
      setStatus(status)
      setChainId(chainId)
      if (address) {
        setBalance(await getBalance(address))
      }
      addWalletListener()
    }
    getData()
  }, [setBalance, setChainId, setWallet, setStatus])

  return (
    <div>
      {children}
    </div>
  )
}

export default WalletWrapper