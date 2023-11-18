// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.16;

import "hardhat/console.sol";

interface ERC20 {
    function approve(address, uint256) external;
    function transferFrom(address, address, uint256) external;
    function transfer(address, uint256) external;
}

contract DobbyFund {

    // Supported token
    ERC20 public immutable token;
    
    // Time window in seconds in which tokens are claimable after the claimableDate
    uint40 public immutable claimableWindow;

    // Deposits
    struct Deposit {
        uint40 claimableDate;
        uint256 amount;
    }
    mapping(address => Deposit[]) public deposits;
    event Deposited(address indexed receiver, uint40 indexed claimableDate, uint256 amount);

    constructor(address token_, uint40 claimableWindow_) {
        token = ERC20(token_);
        claimableWindow = claimableWindow_;
    }

    function deposit(address receiver, uint40 claimableDate, uint256 amount) external {
        token.approve(address(this), amount);
        token.transferFrom(msg.sender, address(this), amount);
        deposits[receiver].push(Deposit(claimableDate, amount));
    }

    function withdraw() external {
        require(deposits[msg.sender].length > 0, 'no deposits');
        for (uint i = 0; i < deposits[msg.sender].length; i++) {
            require(deposits[msg.sender][i].claimableDate > block.timestamp);
            require(block.timestamp < deposits[msg.sender][i].claimableDate + claimableWindow);
            uint256 amountToTransfer = deposits[msg.sender][i].amount;
            delete deposits[msg.sender][i];
            token.transfer(msg.sender, amountToTransfer);
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
