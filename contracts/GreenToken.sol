// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GreenToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant DAILY_MINT_LIMIT = 100_000 * 10**18; // 100k daily limit

    mapping(address => bool) public verifiers;
    mapping(address => uint256) public lastMintTime;
    mapping(address => uint256) public dailyMintAmount;

    struct PhotoSubmission {
        address user;
        string ipfsHash;
        uint256 timestamp;
        uint8 aiScore;
        uint256 rewardAmount;
        bool processed;
    }

    mapping(uint256 => PhotoSubmission) public photoSubmissions;
    uint256 public nextSubmissionId;

    event PhotoSubmitted(uint256 indexed submissionId, address indexed user, string ipfsHash);
    event PhotoVerified(uint256 indexed submissionId, address indexed user, uint8 score, uint256 reward);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);

    modifier onlyVerifier() {
        require(verifiers[msg.sender] || msg.sender == owner(), "Not authorized verifier");
        _;
    }

    constructor() ERC20("GREEN Token", "GREEN") {
        // Initial supply to owner for liquidity
        _mint(msg.sender, 10_000_000 * 10**18); // 10M tokens
    }

    function submitPhoto(string memory ipfsHash) external whenNotPaused {
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");

        photoSubmissions[nextSubmissionId] = PhotoSubmission({
            user: msg.sender,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            aiScore: 0,
            rewardAmount: 0,
            processed: false
        });

        emit PhotoSubmitted(nextSubmissionId, msg.sender, ipfsHash);
        nextSubmissionId++;
    }

    function verifyAndReward(
        uint256 submissionId,
        uint8 aiScore,
        uint256 rewardAmount
    ) external onlyVerifier nonReentrant {
        PhotoSubmission storage submission = photoSubmissions[submissionId];
        require(!submission.processed, "Already processed");
        require(submission.user != address(0), "Invalid submission");
        require(aiScore >= 50, "Score too low for reward");
        require(rewardAmount <= 100 * 10**18, "Reward too high"); // Max 100 tokens per photo

        // Check daily limits
        if (block.timestamp - lastMintTime[submission.user] >= 1 days) {
            dailyMintAmount[submission.user] = 0;
            lastMintTime[submission.user] = block.timestamp;
        }

        require(
            dailyMintAmount[submission.user] + rewardAmount <= DAILY_MINT_LIMIT,
            "Daily limit exceeded"
        );
        require(
            totalSupply() + rewardAmount <= MAX_SUPPLY,
            "Max supply exceeded"
        );

        submission.aiScore = aiScore;
        submission.rewardAmount = rewardAmount;
        submission.processed = true;

        dailyMintAmount[submission.user] += rewardAmount;
        _mint(submission.user, rewardAmount);

        emit PhotoVerified(submissionId, submission.user, aiScore, rewardAmount);
    }

    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
        emit VerifierAdded(verifier);
    }

    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
        emit VerifierRemoved(verifier);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getPhotoSubmission(uint256 submissionId) external view returns (PhotoSubmission memory) {
        return photoSubmissions[submissionId];
    }

    function getUserDailyMintAmount(address user) external view returns (uint256) {
        if (block.timestamp - lastMintTime[user] >= 1 days) {
            return 0;
        }
        return dailyMintAmount[user];
    }
}