// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.16;

import "hardhat/console.sol";

interface ERC20 {
    function approve(address, uint256) external;
    function transferFrom(address, address, uint256) external;
    function balanceOf(address) external view returns (uint256);
}

contract DobbyFund {

    // Supported token
    ERC20 public immutable token;
    // Time window in seconds in which tokens are claimable after the claimableDate
    uint40 public constant claimableWindow = 10 * 365 days;
    // If unclaimed after claimableDate + claimableWindow, funds can be transferred to donationDestination
    address public immutable donationDestination;

    // Deposits
    struct Deposit {
        uint40 claimableDate;
        uint256 amount;
    }
    mapping(address => Deposit[]) public deposits;
    event Deposited(address indexed receiver, uint40 indexed claimableDate, uint256 amount);

    constructor(address token_, address donationDestination_) {
        token = ERC20(token_);
        donationDestination = donationDestination_;
    }

    function deposit(address receiver, uint256 amount, uint40 claimableDate) external {
        token.transferFrom(msg.sender, address(this), amount);
        deposits[receiver].push(Deposit(claimableDate, amount));
    }

    function withdraw() external {
        uint256 totalToTransfer = 0;
        for (uint i = 0; i < deposits[msg.sender].length; i++) {
            if (
                deposits[msg.sender][i].claimableDate > block.timestamp
            ) {
                continue;
            }
            totalToTransfer = totalToTransfer + deposits[msg.sender][i].amount;
            delete deposits[msg.sender][i];
        }
        require(totalToTransfer > 0, 'nothing-to-withdraw');
        token.transferFrom(address(this), msg.sender, totalToTransfer);
    }

    function donateUnclaimed(address receiver) external {
        uint256 totalToTransfer = 0;
        for (uint i = 0; i < deposits[receiver].length; i++) {
            if (
                deposits[receiver][i].claimableDate + claimableWindow > block.timestamp
            ) {
                continue;
            }
            totalToTransfer = totalToTransfer + deposits[receiver][i].amount;
            delete deposits[receiver][i];
        }
        require(totalToTransfer > 0, 'nothing-to-donate');
        token.transferFrom(address(this), donationDestination, totalToTransfer);
    }

    function balanceOf(address account) external view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < deposits[account].length; i++) {
            total = total + deposits[account][i].amount;
        }
        return total;
    }
}
