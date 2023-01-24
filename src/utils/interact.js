import { METAMASK_REDIRECT_URL, STATUS_READY, STATUS_NOT_READY } from "./constants";

const alchemyKey = process.env.REACT_APP_ALCHEMY_API_KEY;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);

const GOAT_CONTRACT_ADDRESS = "0x5CEbE5Cde01aB154fB46B7984D6354DA367bCBaF";
const STAKED_GOAT_CONTRACT_ADDRESS = "0x4f741542b04F4DD5f243994a1C310791D5945eA7";
const GOAT_ABI = require("../contracts/goats.json");
const STAKED_GOAT_ABI = require("../contracts/stakedGoats.json");

export const getBalance = async (address) => {
  const goatContract = new web3.eth.Contract(
    GOAT_ABI,
    GOAT_CONTRACT_ADDRESS
    );
  const stakedGoatContract = new web3.eth.Contract(
    STAKED_GOAT_ABI,
    STAKED_GOAT_CONTRACT_ADDRESS
    );

  const goatBalance = await goatContract.methods.balanceOf(address).call();
  const stakedGoatBalance = await stakedGoatContract.methods.balanceOf(address).call();
  
  return {
    goatBalance,
    stakedGoatBalance
  };
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: STATUS_READY,
        address: addressArray[0],
        chainId: window.ethereum.chainId,
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
        chainId: -1,
      };
    }
  } else {
    window.location.href = METAMASK_REDIRECT_URL;
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must use Metamask or a Web3 browser to mint.
            </a>
          </p>
        </span>
      ),
      chainId: -1,
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: STATUS_READY,
          chainId: window.ethereum.chainId,
        };
      } else {
        return {
          address: "",
          status: STATUS_NOT_READY,
          chainId: -1,
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
        chainId: -1,
      };
    }
  } else {

    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" rel="noreferrer" href={`https://metamask.io/download.html`}>
              You must use Metamask or a Web3 browser to mint.
            </a>
          </p>
        </span>
      ),
    };
  }
};
