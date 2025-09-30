// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Individual KYC Smart Contract
 * @dev Contract to manage individual eKYC - only admin has management rights
 */
contract IndividualKYC is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Individual {
        uint256 id; // Individual ID
        string fullName; // Full name
        uint256 dateOfBirth; // Date of birth (timestamp)
        string address_; // Address
        string nationality; // Nationality
        string cccdNumber; // CCCD/ID card number
        string phone; // Phone number
        string email; // Email
        string frontCccdImage; // Front CCCD image
        string backCccdImage; // Back CCCD image
        address walletAddress; // Wallet address
        bool isApproved; // Is approved
        uint256 createdAt; // Created date (timestamp)
        uint256 updatedAt; // Updated date (timestamp)
        bool exists; // Check if individual exists
    }

    // Mapping to store individual information by wallet address
    mapping(address => Individual) private individuals;
    
    // Array to store list of registered addresses (for admin management)
    address[] public walletAddressList;
    
    // Counter to create unique ID
    uint256 private nextId = 1;

    // Events
    event IndividualRegistered(uint256 indexed id, address indexed walletAddress, string fullName, uint256 timestamp);
    event IndividualUpdated(uint256 indexed id, address indexed walletAddress, string fullName, uint256 timestamp);
    event IndividualDeleted(uint256 indexed id, address indexed walletAddress, uint256 timestamp);
    event IndividualApproved(uint256 indexed id, address indexed walletAddress, bool status, uint256 timestamp);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Only admin can pause contract
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Only admin can unpause contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Only admin can register KYC for individual
     */
    function registerIndividual(
        address _walletAddress,
        string memory _fullName,
        uint256 _dateOfBirth,
        string memory _address,
        string memory _nationality,
        string memory _cccdNumber,
        string memory _phone
    ) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(individuals[_walletAddress].createdAt == 0, "Individual already registered");
        require(!individuals[_walletAddress].exists, "Individual already exists with this wallet address");
        require(_walletAddress != address(0), "Invalid wallet address");
        require(bytes(_fullName).length > 0, "Full name cannot be empty");
        require(bytes(_cccdNumber).length > 0, "CCCD number cannot be empty");

        _createIndividual(_walletAddress, _fullName, _dateOfBirth, _address, _nationality, _cccdNumber, _phone);
    }

    /**
     * @dev Add additional information for individual (images and other info)
     */
    function addAdditionalInfo(
        address _walletAddress,
        string memory _frontCccdImage,
        string memory _backCccdImage,
        string memory _email
    ) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(individuals[_walletAddress].exists, "Individual has not been created");
        
        Individual storage individual = individuals[_walletAddress];
        individual.frontCccdImage = _frontCccdImage;
        individual.backCccdImage = _backCccdImage;
        individual.email = _email;
        individual.updatedAt = block.timestamp;
    }

    /**
     * @dev Internal function to create individual
     */
    function _createIndividual(
        address _walletAddress,
        string memory _fullName,
        uint256 _dateOfBirth,
        string memory _address,
        string memory _nationality,
        string memory _cccdNumber,
        string memory _phone
    ) internal {
        uint256 newId = nextId++;

        Individual storage individual = individuals[_walletAddress];
        individual.id = newId;
        individual.fullName = _fullName;
        individual.dateOfBirth = _dateOfBirth;
        individual.address_ = _address;
        individual.nationality = _nationality;
        individual.cccdNumber = _cccdNumber;
        individual.phone = _phone;
        individual.isApproved = false;
        individual.walletAddress = _walletAddress;
        individual.createdAt = block.timestamp;
        individual.updatedAt = block.timestamp;
        individual.exists = true;

        walletAddressList.push(_walletAddress);

        emit IndividualRegistered(newId, _walletAddress, _fullName, block.timestamp);
    }

    /**
     * @dev Only admin can update basic information
     */
    function updateBasicInfo(
        address _walletAddress,
        string memory _fullName,
        uint256 _dateOfBirth,
        string memory _address,
        string memory _nationality,
        string memory _cccdNumber,
        string memory _phone
    ) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(individuals[_walletAddress].exists, "Individual does not exist");
        require(bytes(_fullName).length > 0, "Full name cannot be empty");

        Individual storage individual = individuals[_walletAddress];
        
        individual.fullName = _fullName;
        individual.dateOfBirth = _dateOfBirth;
        individual.address_ = _address;
        individual.nationality = _nationality;
        individual.cccdNumber = _cccdNumber;
        individual.phone = _phone;
        individual.updatedAt = block.timestamp;

        emit IndividualUpdated(individual.id, _walletAddress, _fullName, block.timestamp);
    }

    /**
     * @dev Update additional information
     */
    function updateAdditionalInfo(
        address _walletAddress,
        string memory _frontCccdImage,
        string memory _backCccdImage,
        string memory _email
    ) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(individuals[_walletAddress].exists, "Individual does not exist");
        
        Individual storage individual = individuals[_walletAddress];
        individual.frontCccdImage = _frontCccdImage;
        individual.backCccdImage = _backCccdImage;
        individual.email = _email;
        individual.updatedAt = block.timestamp;

        emit IndividualUpdated(individual.id, _walletAddress, individual.fullName, block.timestamp);
    }

    /**
     * @dev Only admin can delete individual
     */
    function deleteIndividual(address _walletAddress) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(individuals[_walletAddress].exists, "Individual does not exist");

        uint256 individualId = individuals[_walletAddress].id;
        
        delete individuals[_walletAddress];

        // Remove from wallet address list
        for (uint256 i = 0; i < walletAddressList.length; i++) {
            if (walletAddressList[i] == _walletAddress) {
                walletAddressList[i] = walletAddressList[walletAddressList.length - 1];
                walletAddressList.pop();
                break;
            }
        }

        emit IndividualDeleted(individualId, _walletAddress, block.timestamp);
    }

    /**
     * @dev Only admin can approve/reject individual
     */
    function approveIndividual(address _walletAddress, bool _approvalStatus) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(individuals[_walletAddress].exists, "Individual does not exist");

        individuals[_walletAddress].isApproved = _approvalStatus;
        individuals[_walletAddress].updatedAt = block.timestamp;

        emit IndividualApproved(individuals[_walletAddress].id, _walletAddress, _approvalStatus, block.timestamp);
    }

    /**
     * @dev User can only view their own information
     */
    function viewIndividualInfo(address _walletAddress) public view returns (Individual memory) {
        require(_walletAddress == msg.sender, "Can only view your own information");
        require(individuals[_walletAddress].exists, "Individual does not exist");
        return individuals[_walletAddress];
    }

    /**
     * @dev Admin can view specific individual information
     */
    function adminViewIndividualInfo(address _walletAddress) 
        public 
        view 
        onlyRole(ADMIN_ROLE) 
        returns (Individual memory) 
    {
        require(individuals[_walletAddress].exists, "Individual does not exist");
        return individuals[_walletAddress];
    }

    /**
     * @dev Check if individual exists
     */
    function checkIndividualExists(address _walletAddress) public view returns (bool) {
        return individuals[_walletAddress].exists;
    }

    /**
     * @dev Admin can view total number of registered individuals
     */
    function getTotalIndividuals() public view onlyRole(ADMIN_ROLE) returns (uint256) {
        return walletAddressList.length;
    }

    /**
     * @dev Admin can get list of all registered wallet addresses
     */
    function getWalletAddressList() public view onlyRole(ADMIN_ROLE) returns (address[] memory) {
        return walletAddressList;
    }

    /**
     * @dev Get individual information by range (pagination)
     */
    function getIndividualListByRange(uint256 _start, uint256 _end) 
        public 
        view 
        onlyRole(ADMIN_ROLE) 
        returns (Individual[] memory) 
    {
        require(_start < _end, "Start must be less than end");
        require(_end <= walletAddressList.length, "End exceeds total individuals");

        Individual[] memory result = new Individual[](_end - _start);
        
        for (uint256 i = _start; i < _end; i++) {
            result[i - _start] = individuals[walletAddressList[i]];
        }
        
        return result;
    }
}