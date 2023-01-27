import axios from 'axios';

export const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
}

export const getEnsName = async (address) => {
    const url = `https://ens.fafrd.workers.dev/ens/${address}`;
    const response = await axios.get(url);
    return response.data.reverseRecord;
}