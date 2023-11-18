require('dotenv/config');
require('@nomicfoundation/hardhat-toolbox');

const RPC_URL = process.env.RPC_URL;

if (!RPC_URL) {
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
                url: RPC_URL,
            },
            initialBaseFeePerGas: 1,
        },
    },
};
