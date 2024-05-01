export function getContract(web3, abi, contractAddress) {
    return new web3.eth.Contract(abi, contractAddress);
}