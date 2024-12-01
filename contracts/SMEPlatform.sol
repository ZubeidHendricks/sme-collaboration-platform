// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Main platform contract for managing SME collaborations
contract SMEPlatform {
    struct SME {
        string name;
        address wallet;
        uint256 reputationScore;
        uint256 completedProjects;
        bool isVerified;
        mapping(bytes32 => bool) skills;
    }
    
    struct Project {
        string name;
        string description;
        address owner;
        uint256 budget;
        uint256 deadline;
        bool isActive;
        uint256 requiredTeamSize;
        bytes32[] requiredSkills;
        mapping(address => bool) participants;
        mapping(address => uint256) profitShares;
    }
    
    mapping(address => SME) public smes;
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    
    event SMERegistered(address indexed smeAddress, string name);
    event ProjectCreated(uint256 indexed projectId, string name, address owner);
    event ProjectJoined(uint256 indexed projectId, address participant);
    
    modifier onlyRegisteredSME() {
        require(smes[msg.sender].wallet != address(0), "Must be registered SME");
        _;
    }
    
    function registerSME(string memory _name) public {
        require(smes[msg.sender].wallet == address(0), "Already registered");
        
        SME storage newSME = smes[msg.sender];
        newSME.name = _name;
        newSME.wallet = msg.sender;
        newSME.reputationScore = 100;
        
        emit SMERegistered(msg.sender, _name);
    }
    
    function createProject(
        string memory _name,
        string memory _description,
        uint256 _budget,
        uint256 _deadline,
        uint256 _teamSize,
        bytes32[] memory _requiredSkills
    ) public onlyRegisteredSME {
        Project storage newProject = projects[projectCount];
        newProject.name = _name;
        newProject.description = _description;
        newProject.owner = msg.sender;
        newProject.budget = _budget;
        newProject.deadline = _deadline;
        newProject.isActive = true;
        newProject.requiredTeamSize = _teamSize;
        newProject.requiredSkills = _requiredSkills;
        
        emit ProjectCreated(projectCount, _name, msg.sender);
        projectCount++;
    }
    
    function joinProject(uint256 _projectId) public onlyRegisteredSME {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project not active");
        require(!project.participants[msg.sender], "Already participating");
        
        project.participants[msg.sender] = true;
        emit ProjectJoined(_projectId, msg.sender);
    }
}