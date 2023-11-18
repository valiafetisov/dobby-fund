// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.16;

interface Erc20Like {
    function approve(address, uint256) external;
    function transferFrom(address, address, uint256) external;
    function balanceOf(address) external view returns (uint256);
}

interface SdaiLike {
    function dai() external view returns (address);
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
}

interface UniswapRouterLike {
    function WETH() external view returns (address);
    function swapExactETHForTokens(uint256 amountOutMin, address[] memory path, address to, uint256 deadline)
        external
        payable
        returns (uint256[] memory amounts);
}

contract DobbyFund {

    // Supported token
    Erc20Like public immutable token;
    
    // Time window in seconds in which tokens are claimable after the claimableDate
    uint40 public constant claimableWindow = 10 * 365 days;
    
    // If unclaimed after claimableDate + claimableWindow, funds can be transferred to donationDestination
    address public immutable donationDestination;
    
    // Exchange router
    UniswapRouterLike public immutable router;

    // Deposits
    struct Deposit {
        uint40 claimableDate;
        uint256 amount;
    }
    mapping(address => Deposit[]) public deposits;

    // Events
    event Deposited(address indexed receiver, uint40 indexed claimableDate, uint256 amount);
    event Withdraw(address indexed receiver, uint256 amount);
    event Donate(address indexed receiver, uint256 amount);

    constructor(address token_, address donationDestination_, address router_) {
        token = Erc20Like(token_);
        donationDestination = donationDestination_;
        router = UniswapRouterLike(router_);
    }

    function deposit(address receiver, uint40 claimableDate, uint256 amount) external {
        token.transferFrom(msg.sender, address(this), amount);
        deposits[receiver].push(Deposit(claimableDate, amount));
        emit Deposited(receiver, claimableDate, amount);
    }

    function depositEth(address receiver, uint40 claimableDate) external payable returns (uint256) {
        // exchange to dai
        address[] memory path = new address[](2);
        path[0] = router.WETH();
        path[1] = SdaiLike(address(token)).dai();
        uint256[] memory amounts = router.swapExactETHForTokens{ value: msg.value }(0, path, address(this), block.timestamp + 15);
        uint256 daiAmount = amounts[1];

        // deposit to sdai
        Erc20Like(path[1]).approve(address(token), daiAmount);
        uint256 sDaiAmount = SdaiLike(address(token)).deposit(daiAmount, address(this));

        // record amounts
        deposits[receiver].push(Deposit(claimableDate, sDaiAmount));
        emit Deposited(receiver, claimableDate, sDaiAmount);
        return sDaiAmount;
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
        emit Withdraw(msg.sender, totalToTransfer);
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
        emit Donate(receiver, totalToTransfer);
    }

    function balanceOf(address account) external view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < deposits[account].length; i++) {
            total = total + deposits[account][i].amount;
        }
        return total;
    }
}
