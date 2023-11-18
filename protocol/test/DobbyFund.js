const { expect } = require('chai');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');
const { tokenAddress, donationDestination, uniswapRouter } = require('../scripts/deploy');

const claimableWindow = 10 * 365 * 24 * 60 * 60;

const overwriteSdaiBalance = async (userAddress, desiredBalance) => {
    const mappingSlot = 1;
    const slot = ethers.utils.solidityKeccak256(['uint256', 'uint256'], [userAddress, mappingSlot]);
    await ethers.provider.send('hardhat_setStorageAt', [
        tokenAddress,
        slot,
        ethers.utils.hexlify(ethers.utils.zeroPad(desiredBalance, 32)),
    ]);
};

describe('Token contract', function () {
    async function deployProtocolFixture() {
        const DobbyFund = await ethers.getContractFactory('DobbyFund');
        const [deployer, alice, bob] = await ethers.getSigners();
        const protocol = await DobbyFund.deploy(tokenAddress, donationDestination, uniswapRouter);
        await protocol.deployed();
        const token = new ethers.Contract(
            tokenAddress,
            [
                'function balanceOf(address) external view returns (uint256)',
                'function approve(address spender, uint256 value) external returns (bool)',
            ],
            deployer
        );
        return { token, DobbyFund, protocol, deployer, alice, bob };
    }

    describe('Deployment', function () {
        it('Should set the right token address', async function () {
            const { protocol } = await loadFixture(deployProtocolFixture);
            expect(await protocol.token()).to.equal(tokenAddress);
            expect(await protocol.donationDestination()).to.equal(donationDestination);
            expect(await protocol.claimableWindow()).to.equal(claimableWindow);
        });
    });

    describe('Deposits to its own + withdraws', function () {
        it('Deployer locks money for itself', async function () {
            const { token, protocol, deployer } = await loadFixture(deployProtocolFixture);

            // generate tokens
            const totalBalance = 2;
            await overwriteSdaiBalance(deployer.address, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);

            // deposit
            const deadline = Math.floor(Date.now() / 1000) + 100;
            await token.approve(protocol.address, totalBalance / 2);
            await protocol.deposit(deployer.address, deadline, totalBalance / 2);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance / 2);

            // deposit again
            await token.approve(protocol.address, totalBalance / 2);
            await protocol.deposit(deployer.address, deadline + 100, totalBalance / 2);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);
        });

        it('Deployer deposits and withdraws', async function () {
            const { token, protocol, deployer } = await loadFixture(deployProtocolFixture);

            // generate tokens
            const totalBalance = 2;
            await overwriteSdaiBalance(deployer.address, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);

            // deposit
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            await token.approve(protocol.address, totalBalance);
            await protocol.deposit(deployer.address, deadline, totalBalance);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);

            // widthdraw before deadline should fail
            await expect(protocol.withdraw()).to.be.revertedWith('nothing-to-withdraw');
            expect(await token.balanceOf(deployer.address)).to.equal(0);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);

            // withdraw after the deadline should work
            await time.increaseTo(deadline + 1);
            await protocol.withdraw();
            expect(await protocol.balanceOf(deployer.address)).to.equal(0);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);
        });
    });

    describe('Deposits to external account', function () {
        it('Deployer locks money for alice, alice withdraws', async function () {
            const { token, protocol, deployer, alice } = await loadFixture(deployProtocolFixture);

            // generate tokens
            const totalBalance = 2;
            await overwriteSdaiBalance(deployer.address, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);

            // deposit
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            await token.approve(protocol.address, totalBalance);
            await protocol.deposit(alice.address, deadline, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);
            expect(await protocol.balanceOf(alice.address)).to.equal(totalBalance);

            // widthdraw before deadline should fail
            const alicesProtocol = protocol.connect(alice);
            await expect(alicesProtocol.withdraw()).to.be.revertedWith('nothing-to-withdraw');
            expect(await alicesProtocol.balanceOf(alice.address)).to.equal(totalBalance);
            expect(await token.balanceOf(alice.address)).to.equal(0);

            // withdraw after the deadline should work
            await time.increaseTo(deadline + 1);
            await alicesProtocol.withdraw();
            expect(await alicesProtocol.balanceOf(alice.address)).to.equal(0);
            expect(await token.balanceOf(alice.address)).to.equal(totalBalance);
        });
    });

    describe('Deposits pure ETH', function () {
        it('Deployer locks ETH for sDAI', async function () {
            const { token, protocol, deployer } = await loadFixture(deployProtocolFixture);
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            const inputAmountOfEth = ethers.utils.parseEther('1.0');
            const expectedAmountOfSdai = await protocol.callStatic.depositEth(deployer.address, deadline, {
                value: inputAmountOfEth,
            });

            // deposits and exchanges
            await protocol.depositEth(deployer.address, deadline, { value: inputAmountOfEth });
            const sdaiBalance = await protocol.balanceOf(deployer.address);
            expect(sdaiBalance).to.be.above(expectedAmountOfSdai.sub(1000));
            expect(await token.balanceOf(protocol.address)).to.be.above(expectedAmountOfSdai.sub(1000));

            // withdraws after deadilne
            await time.increaseTo(deadline + 1);
            await protocol.withdraw();
            expect(await protocol.balanceOf(deployer.address)).to.equal(0);
            expect(await token.balanceOf(deployer.address)).to.equal(sdaiBalance);
        });
    });

    describe('Donation strategy', function () {
        it('Deployer locks money, bob tiggers donation', async function () {
            const { token, protocol, deployer, bob } = await loadFixture(deployProtocolFixture);
            const destinationInitialBalance = await token.balanceOf(donationDestination);

            // generate tokens
            const totalBalance = 2;
            await overwriteSdaiBalance(deployer.address, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);

            // deposit
            const deadline = Math.floor(Date.now() / 1000) + 1000;
            await token.approve(protocol.address, totalBalance);
            await protocol.deposit(deployer.address, deadline, totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);

            // donation before deadline should fail
            const bobsProtocol = protocol.connect(bob);
            await expect(bobsProtocol.donateUnclaimed(deployer.address)).to.be.revertedWith('nothing-to-donate');
            expect(await bobsProtocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(donationDestination)).to.equal(destinationInitialBalance);

            // donation after deadline but before claimableWindow expired should also fail
            await time.increaseTo(deadline + 1);
            await expect(bobsProtocol.donateUnclaimed(deployer.address)).to.be.revertedWith('nothing-to-donate');
            expect(await bobsProtocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(donationDestination)).to.equal(destinationInitialBalance);

            // donation after the deadline + claimableWindow should work
            await time.increaseTo(deadline + claimableWindow + 1);
            await bobsProtocol.donateUnclaimed(deployer.address);
            expect(await bobsProtocol.balanceOf(deployer.address)).to.equal(0);
            expect(await token.balanceOf(donationDestination)).to.equal(destinationInitialBalance + totalBalance);
        });
    });
});
