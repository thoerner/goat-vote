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

export const WalletWrapper = props => {

  

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
            props.setWallet(accounts[0])
            props.setStatus(STATUS_READY)
            getData()
          } else {
            props.setWallet("")
            props.setStatus(STATUS_NOT_READY)
          }
        })
        window.ethereum.on("chainChanged", (_chainId) => {
          props.setChainId(_chainId)
        })
      } else {
        props.setStatus(STATUS_NO_MASK)
      }
    }
    const getData = async () => {
      const { address, status, chainId } = await getCurrentWalletConnected()
      props.setWallet(address)
      props.setStatus(status)
      props.setChainId(chainId)
      if (address) {
        props.setBalance(await getBalance(address))
      }
      addWalletListener()
    }
    getData()
  }, [])

  return (
    <div>
      {props.children}
    </div>
  )
}

export default WalletWrapper