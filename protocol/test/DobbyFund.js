const { expect } = require('chai');
const { loadFixture, time } = require('@nomicfoundation/hardhat-network-helpers');

const tokenAddress = '0x83F20F44975D03b1b09e64809B757c47f942BEeA';
const donationDestination = '0x53Dc0c92380cce50e0C3D9DF625478C3d4069bf3';
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
        const protocol = await DobbyFund.deploy(tokenAddress, donationDestination);
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
            await protocol.deposit(deployer.address, totalBalance / 2, deadline);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance / 2);

            // deposit again
            await token.approve(protocol.address, totalBalance / 2);
            await protocol.deposit(deployer.address, totalBalance / 2, deadline + 100);
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
            await protocol.deposit(deployer.address, totalBalance, deadline);
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);

            // widthdraw fails before deadline should fail
            await expect(protocol.withdraw()).to.be.revertedWith('nothing-to-withdraw');
            expect(await protocol.balanceOf(deployer.address)).to.equal(totalBalance);
            expect(await token.balanceOf(deployer.address)).to.equal(0);

            // withdraw after the deadline should work
            await time.increaseTo(deadline + 1);
            await protocol.withdraw();
            expect(await protocol.balanceOf(deployer.address)).to.equal(0);
            expect(await token.balanceOf(deployer.address)).to.equal(totalBalance);
        });
    });
});
