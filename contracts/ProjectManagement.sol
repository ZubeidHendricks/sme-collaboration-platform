// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ProjectManagement is ReentrancyGuard {
    struct Project {
        string name;
        string description;
        address owner;
        uint256 budget;
        uint256 deadline;
        uint256 teamSize;
        bool isActive;
        ProjectStatus status;
        mapping(address => bool) participants;
        mapping(address => uint256) profitShares;
        mapping(address => bool) completionVotes;
        uint256 completionVoteCount;
    }

    enum ProjectStatus { Open, InProgress, Completed, Cancelled }

    mapping(uint256 => Project) public projects;
    uint256 public projectCount;
    IERC20 public paymentToken;
    
    event ProjectCreated(uint256 indexed projectId, string name, address owner);
    event ParticipantJoined(uint256 indexed projectId, address participant);
    event ProjectStatusUpdated(uint256 indexed projectId, ProjectStatus status);
    
    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
    }
    
    function createProject(
        string memory _name,
        string memory _description,
        uint256 _budget,
        uint256 _deadline,
        uint256 _teamSize
    ) external returns (uint256) {
        require(_deadline > block.timestamp, "Invalid deadline");
        Project storage newProject = projects[projectCount];
        newProject.name = _name;
        newProject.description = _description;
        newProject.owner = msg.sender;
        newProject.budget = _budget;
        newProject.deadline = _deadline;
        newProject.teamSize = _teamSize;
        newProject.isActive = true;
        newProject.status = ProjectStatus.Open;
        
        emit ProjectCreated(projectCount, _name, msg.sender);
        return projectCount++;
    }

    function joinProject(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Open, "Project not open");
        require(!project.participants[msg.sender], "Already participating");
        
        project.participants[msg.sender] = true;
        emit ParticipantJoined(_projectId, msg.sender);
    }
}