// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title EcoNFT
 * @dev NFT for verified environmental conservation photos
 * Each NFT represents a verified eco-friendly action with AI score
 */
contract EcoNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Minter role - can mint NFTs
    mapping(address => bool) public minters;

    // NFT metadata
    struct EcoAction {
        uint8 aiScore;
        uint256 greenTokensEarned;
        uint256 timestamp;
        string category;
    }

    mapping(uint256 => EcoAction) public ecoActions;

    // Stats
    uint256 public totalEcoActions;
    mapping(address => uint256) public userEcoCount;

    event EcoNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint8 aiScore,
        uint256 greenTokensEarned,
        string category
    );

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    constructor() ERC721("EcoHunt Action", "ECOACT") {
        // Owner is automatically a minter
    }

    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
    }

    /**
     * @dev Mint a new EcoNFT for verified environmental action
     * @param to Address to mint to
     * @param tokenURI IPFS URI for metadata
     * @param aiScore AI verification score (0-100)
     * @param greenTokensEarned Amount of GREEN tokens earned
     * @param category Category of eco action
     */
    function mintEcoNFT(
        address to,
        string memory tokenURI,
        uint8 aiScore,
        uint256 greenTokensEarned,
        string memory category
    ) external onlyMinter returns (uint256) {
        require(to != address(0), "Invalid address");
        require(aiScore >= 50, "Score too low for NFT");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        ecoActions[newTokenId] = EcoAction({
            aiScore: aiScore,
            greenTokensEarned: greenTokensEarned,
            timestamp: block.timestamp,
            category: category
        });

        totalEcoActions++;
        userEcoCount[to]++;

        emit EcoNFTMinted(newTokenId, to, aiScore, greenTokensEarned, category);

        return newTokenId;
    }

    /**
     * @dev Get EcoAction details for a token
     */
    function getEcoAction(uint256 tokenId) external view returns (
        uint8 aiScore,
        uint256 greenTokensEarned,
        uint256 timestamp,
        string memory category
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        EcoAction memory action = ecoActions[tokenId];
        return (action.aiScore, action.greenTokensEarned, action.timestamp, action.category);
    }

    /**
     * @dev Get total supply of NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }

}

