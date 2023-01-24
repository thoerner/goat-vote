export const shortenAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
}
    