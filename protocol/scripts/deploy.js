const configs = {
    goerli: {
        tokenAddress: '0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C',
        donationDestination: '0x53Dc0c92380cce50e0C3D9DF625478C3d4069bf3',
        uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
    hardhat: {
        tokenAddress: '0xD8134205b0328F5676aaeFb3B2a0DC15f4029d8C',
        // tokenAddress: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
        donationDestination: '0x53Dc0c92380cce50e0C3D9DF625478C3d4069bf3',
        uniswapRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    },
};
const config = configs[network.name];

async function deploy() {
    // This is just a convenience check
    if (network.name === 'hardhat') {
        console.warn(
            'You are trying to deploy a contract to the Hardhat Network, which' +
                'gets automatically created and destroyed every time. Use the Hardhat' +
                " option '--network localhost'"
        );
    }

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log('Deploying the contracts with the account:', await deployer.getAddress());

    console.log('Account balance:', (await deployer.getBalance()).toString());

    const DobbyFund = await ethers.getContractFactory('DobbyFund');
    const protocol = await DobbyFund.deploy(config.tokenAddress, config.donationDestination, config.uniswapRouter);
    await protocol.deployed();

    console.log('Deployed protocol address:', protocol.address);
    return protocol;
}

if (require.main === module) {
    deploy()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = {
    deploy,
    ...config,
};
