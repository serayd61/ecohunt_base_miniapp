// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GreenTokenV2
 * @dev Reward token with verifier role and daily/user caps for Mini App rewards
 */
contract GreenTokenV2 is ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant MAX_PER_REWARD = 100 * 10**18; // max per verification
    uint256 public constant DAILY_USER_LIMIT = 100_000 * 10**18;

    mapping(address => bool) public verifiers;
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public dailyMintAmount;

    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event RewardMinted(address indexed user, uint256 amount, uint8 aiScore);

    modifier onlyVerifier() {
        require(verifiers[_msgSender()] || _msgSender() == owner(), "Not verifier");
        _;
    }

    constructor() ERC20("GREEN Token", "GREEN") {
        _mint(_msgSender(), 10_000_000 * 10**18); // initial liquidity to owner
    }

    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function verifyAndReward(address user, uint8 aiScore, uint256 rewardAmount)
        external
        onlyVerifier
        nonReentrant
        whenNotPaused
    {
        require(user != address(0), "Invalid user");
        require(aiScore >= 50, "Score too low");
        require(rewardAmount > 0 && rewardAmount <= MAX_PER_REWARD, "Invalid reward");

        // daily window per user
        if (block.timestamp - lastMintTime[user] >= 1 days) {
            dailyMintAmount[user] = 0;
            lastMintTime[user] = block.timestamp;
        }
        require(dailyMintAmount[user] + rewardAmount <= DAILY_USER_LIMIT, "Daily limit");
        require(totalSupply() + rewardAmount <= MAX_SUPPLY, "Max supply");

        dailyMintAmount[user] += rewardAmount;
        _mint(user, rewardAmount);
        emit RewardMinted(user, rewardAmount, aiScore);
    }
}


