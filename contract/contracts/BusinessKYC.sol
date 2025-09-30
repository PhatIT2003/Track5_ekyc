// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Business KYC Smart Contract
 * @dev Contract to manage enterprise eKYC - only admin has management rights
 */
contract BusinessKYC is ReentrancyGuard, Pausable, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Enterprise {
        uint256 id; // Enterprise ID
        string companyName; // Company name
        string companyType; // Type of company
        uint256 establishedDate; // Established date (timestamp)
        string businessRegistrationNumber; // Business registration number
        string address_; // Address
        string industry; // Industry
        uint256 employeeCount; // Number of employees
        string certificateImage; // Certificate image
        string idCardFrontImage; // ID card front image
        string idCardBackImage; // ID card back image
        bool isApproved; // Is approved
        string email; // Email
        address walletAddress; // Wallet address
        uint256 createdAt; // Created date (timestamp)
        uint256 updatedAt; // Updated date (timestamp)
        bool exists; // Check if enterprise exists
    }

    // Mapping to store enterprise information by wallet address
    mapping(address => Enterprise) private enterprises;
    
    // Array to store list of registered addresses (for admin management)
    address[] public walletAddressList;
    
    // Counter to create unique ID
    uint256 private nextId = 1;

    // Events
    event EnterpriseRegistered(uint256 indexed id, address indexed walletAddress, string companyName, uint256 timestamp);
    event EnterpriseUpdated(uint256 indexed id, address indexed walletAddress, string companyName, uint256 timestamp);
    event EnterpriseDeleted(uint256 indexed id, address indexed walletAddress, uint256 timestamp);
    event EnterpriseApproved(uint256 indexed id, address indexed walletAddress, bool status, uint256 timestamp);

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
     * @dev Only admin can register KYC for enterprise
     */
    function registerEnterprise(
        address _walletAddress,
        string memory _companyName,
        string memory _companyType,
        uint256 _establishedDate,
        string memory _businessRegistrationNumber,
        string memory _address,
        string memory _industry,
        uint256 _employeeCount
    ) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(enterprises[_walletAddress].createdAt == 0, "Enterprise already registered");
        require(!enterprises[_walletAddress].exists, "Enterprise already exists with this wallet address");
        require(_walletAddress != address(0), "Invalid wallet address");
        require(bytes(_companyName).length > 0, "Company name cannot be empty");
        require(bytes(_businessRegistrationNumber).length > 0, "Business registration number cannot be empty");

        _createEnterprise(_walletAddress, _companyName, _companyType, _establishedDate, _businessRegistrationNumber, _address, _industry, _employeeCount);
    }

    /**
     * @dev Add additional information for enterprise (images and other info)
     */
    function addAdditionalInfo(
        address _walletAddress,
        string memory _certificateImage,
        string memory _idCardFrontImage,
        string memory _idCardBackImage,
        string memory _email
    ) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(enterprises[_walletAddress].exists, "Enterprise has not been created");
        
        Enterprise storage enterprise = enterprises[_walletAddress];
        enterprise.certificateImage = _certificateImage;
        enterprise.idCardFrontImage = _idCardFrontImage;
        enterprise.idCardBackImage = _idCardBackImage;
        enterprise.email = _email;
        enterprise.updatedAt = block.timestamp;
    }

    /**
     * @dev Internal function to create enterprise
     */
    function _createEnterprise(
        address _walletAddress,
        string memory _companyName,
        string memory _companyType,
        uint256 _establishedDate,
        string memory _businessRegistrationNumber,
        string memory _address,
        string memory _industry,
        uint256 _employeeCount
    ) internal {
        uint256 newId = nextId++;

        Enterprise storage enterprise = enterprises[_walletAddress];
        enterprise.id = newId;
        enterprise.companyName = _companyName;
        enterprise.companyType = _companyType;
        enterprise.establishedDate = _establishedDate;
        enterprise.businessRegistrationNumber = _businessRegistrationNumber;
        enterprise.address_ = _address;
        enterprise.industry = _industry;
        enterprise.employeeCount = _employeeCount;
        enterprise.isApproved = false;
        enterprise.walletAddress = _walletAddress;
        enterprise.createdAt = block.timestamp;
        enterprise.updatedAt = block.timestamp;
        enterprise.exists = true;

        walletAddressList.push(_walletAddress);

        emit EnterpriseRegistered(newId, _walletAddress, _companyName, block.timestamp);
    }

    /**
     * @dev Only admin can update basic information
     */
    function updateBasicInfo(
        address _walletAddress,
        string memory _companyName,
        string memory _companyType,
        uint256 _establishedDate,
        string memory _businessRegistrationNumber,
        string memory _address,
        string memory _industry,
        uint256 _employeeCount
    ) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");
        require(bytes(_companyName).length > 0, "Company name cannot be empty");

        Enterprise storage enterprise = enterprises[_walletAddress];
        
        enterprise.companyName = _companyName;
        enterprise.companyType = _companyType;
        enterprise.establishedDate = _establishedDate;
        enterprise.businessRegistrationNumber = _businessRegistrationNumber;
        enterprise.address_ = _address;
        enterprise.industry = _industry;
        enterprise.employeeCount = _employeeCount;
        enterprise.updatedAt = block.timestamp;

        emit EnterpriseUpdated(enterprise.id, _walletAddress, _companyName, block.timestamp);
    }

    /**
     * @dev Update additional information
     */
    function updateAdditionalInfo(
        address _walletAddress,
        string memory _certificateImage,
        string memory _idCardFrontImage,
        string memory _idCardBackImage,
        string memory _email
    ) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");
        
        Enterprise storage enterprise = enterprises[_walletAddress];
        enterprise.certificateImage = _certificateImage;
        enterprise.idCardFrontImage = _idCardFrontImage;
        enterprise.idCardBackImage = _idCardBackImage;
        enterprise.email = _email;
        enterprise.updatedAt = block.timestamp;

        emit EnterpriseUpdated(enterprise.id, _walletAddress, enterprise.companyName, block.timestamp);
    }

    /**
     * @dev Only admin can delete enterprise
     */
    function deleteEnterprise(address _walletAddress) public onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");

        uint256 enterpriseId = enterprises[_walletAddress].id;
        
        delete enterprises[_walletAddress];

        // Remove from wallet address list
        for (uint256 i = 0; i < walletAddressList.length; i++) {
            if (walletAddressList[i] == _walletAddress) {
                walletAddressList[i] = walletAddressList[walletAddressList.length - 1];
                walletAddressList.pop();
                break;
            }
        }

        emit EnterpriseDeleted(enterpriseId, _walletAddress, block.timestamp);
    }

    /**
     * @dev Only admin can approve/reject enterprise
     */
    function approveEnterprise(address _walletAddress, bool _approvalStatus) public onlyRole(ADMIN_ROLE) whenNotPaused {
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");

        enterprises[_walletAddress].isApproved = _approvalStatus;
        enterprises[_walletAddress].updatedAt = block.timestamp;

        emit EnterpriseApproved(enterprises[_walletAddress].id, _walletAddress, _approvalStatus, block.timestamp);
    }

    /**
     * @dev User can only view their own information
     */
    function viewEnterpriseInfo(address _walletAddress) public view returns (Enterprise memory) {
        require(_walletAddress == msg.sender, "Can only view your own information");
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");
        return enterprises[_walletAddress];
    }

    /**
     * @dev Admin can view specific enterprise information
     */
    function adminViewEnterpriseInfo(address _walletAddress) 
        public 
        view 
        onlyRole(ADMIN_ROLE) 
        returns (Enterprise memory) 
    {
        require(enterprises[_walletAddress].exists, "Enterprise does not exist");
        return enterprises[_walletAddress];
    }

    /**
     * @dev Check if enterprise exists
     */
    function checkEnterpriseExists(address _walletAddress) public view returns (bool) {
        return enterprises[_walletAddress].exists;
    }

    /**
     * @dev Admin can view total number of registered enterprises
     */
    function getTotalEnterprises() public view onlyRole(ADMIN_ROLE) returns (uint256) {
        return walletAddressList.length;
    }

    /**
     * @dev Admin can get list of all registered wallet addresses
     */
    function getWalletAddressList() public view onlyRole(ADMIN_ROLE) returns (address[] memory) {
        return walletAddressList;
    }

    /**
     * @dev Get enterprise information by range (pagination)
     */
    function getEnterpriseListByRange(uint256 _start, uint256 _end) 
        public 
        view 
        onlyRole(ADMIN_ROLE) 
        returns (Enterprise[] memory) 
    {
        require(_start < _end, "Start must be less than end");
        require(_end <= walletAddressList.length, "End exceeds total enterprises");

        Enterprise[] memory result = new Enterprise[](_end - _start);
        
        for (uint256 i = _start; i < _end; i++) {
            result[i - _start] = enterprises[walletAddressList[i]];
        }
        
        return result;
    }
}