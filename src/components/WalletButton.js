import { connectWallet } from "../utils/interact.js"
import { shortenAddress } from "../utils/tools.js"

export const WalletButton = props => {
  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet()
    props.setStatus(walletResponse.status)
    props.setWallet(walletResponse.address)
  }
  return (
      <button style={props.centered ? styles.walletButtonCentered : styles.walletButton} onClick={connectWalletPressed}>
        {props.walletAddress.length > 0 ? (
          <span>{shortenAddress(props.walletAddress)}</span>
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>
  )
}

const styles = {
  walletButton: {

    cursor: "pointer",
  },
  walletButtonCentered: {
   
    cursor: "pointer",
    left: "50%",
    transform: "translateX(-50%)",
  },
}
