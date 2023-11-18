// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.16;

import "hardhat/console.sol";

interface ERC20 {
    function approve(address, uint256) external;
    function transferFrom(address, address, uint256) external;
}

contract DobbyFund {

    // Supported token
    ERC20 public immutable token;
    address public immutable donationDestination;
    
    // Time window in seconds in which tokens are claimable after the claimableDate
    uint40 public constant claimableWindow = 10 * 365 days;

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

    function deposit(address receiver, uint40 claimableDate, uint256 amount) external {
        token.approve(address(this), amount);
        token.transferFrom(msg.sender, address(this), amount);
        deposits[receiver].push(Deposit(claimableDate, amount));
    }

    function withdraw() external {
        require(deposits[msg.sender].length > 0, 'no deposits');
        for (uint i = 0; i < deposits[msg.sender].length; i++) {
            if (
                deposits[msg.sender][i].claimableDate < block.timestamp
            ) {
                continue;
            }
            uint256 amountToTransfer = deposits[msg.sender][i].amount;
            delete deposits[msg.sender][i];
            token.transferFrom(address(this), msg.sender, amountToTransfer);
        }
    }

    function donateUnclained(address receiver) external {
        require(deposits[receiver].length > 0, 'no deposits');
        for (uint i = 0; i < deposits[receiver].length; i++) {
            if (
                deposits[receiver][i].claimableDate + claimableWindow < block.timestamp
            ) {
                continue;
            }
            uint256 amountToTransfer = deposits[receiver][i].amount;
            delete deposits[receiver][i];
            token.transferFrom(address(this), donationDestination, amountToTransfer);
        }
    }

    function balanceOf(address account) external view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < deposits[account].length; i++) {
            total = total + deposits[account][i].amount;
        }
        return total;
    }
}
