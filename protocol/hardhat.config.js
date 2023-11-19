require('dotenv/config');
require('@nomicfoundation/hardhat-toolbox');

if (!process.env.RPC_URL) {
    throw new Error('RPC_URL env variable not set, please check your `.env` file');
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.16',
    networks: {
        hardhat: {
            chainId: 1337,
            blockNumber: 18596917,
            forking: {
                url: process.env.RPC_URL,
            },
            initialBaseFeePerGas: 1,
        },
        goerli: {
            url: process.env.RPC_URL,
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
};
