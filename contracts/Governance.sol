// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SMEGovernance is AccessControl {
    bytes32 public constant MEMBER_ROLE = keccak256("MEMBER_ROLE");
    uint256 private constant VOTING_PERIOD = 7 days;
    uint256 private constant EXECUTION_DELAY = 2 days;

    struct Proposal {
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 executionTime;
        bool executed;
        bool canceled;
        address proposer;
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        address proposer
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCanceled(uint256 indexed proposalId);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MEMBER_ROLE, msg.sender);
    }

    function createProposal(
        string memory _title,
        string memory _description
    ) external onlyRole(MEMBER_ROLE) returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 proposalId = proposalCount++;
        Proposal storage proposal = proposals[proposalId];
        proposal.title = _title;
        proposal.description = _description;
        proposal.startTime = block.timestamp;
        proposal.proposer = msg.sender;

        emit ProposalCreated(proposalId, _title, msg.sender);
        return proposalId;
    }

    function castVote(uint256 _proposalId, bool _support) 
        external 
        onlyRole(MEMBER_ROLE) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(isProposalActive(_proposalId), "Proposal not active");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        proposal.hasVoted[msg.sender] = true;

        if (_support) {
            proposal.forVotes += 1;
        } else {
            proposal.againstVotes += 1;
        }

        emit VoteCast(_proposalId, msg.sender, _support);
    }

    function executeProposal(uint256 _proposalId) external {
        require(canBeExecuted(_proposalId), "Cannot execute");
        
        Proposal storage proposal = proposals[_proposalId];
        proposal.executed = true;
        proposal.executionTime = block.timestamp;

        emit ProposalExecuted(_proposalId);
    }

    function cancelProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(msg.sender == proposal.proposer, "Not proposer");
        require(!proposal.executed, "Already executed");
        require(!proposal.canceled, "Already canceled");

        proposal.canceled = true;
        emit ProposalCanceled(_proposalId);
    }

    function isProposalActive(uint256 _proposalId) 
        public 
        view 
        returns (bool) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            !proposal.executed &&
            !proposal.canceled &&
            block.timestamp < proposal.startTime + VOTING_PERIOD
        );
    }

    function canBeExecuted(uint256 _proposalId) 
        public 
        view 
        returns (bool) 
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            !proposal.executed &&
            !proposal.canceled &&
            block.timestamp >= proposal.startTime + VOTING_PERIOD &&
            block.timestamp <= proposal.startTime + VOTING_PERIOD + EXECUTION_DELAY &&
            proposal.forVotes > proposal.againstVotes
        );
    }

    function getProposalDetails(uint256 _proposalId)
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 forVotes,
            uint256 againstVotes,
            uint256 startTime,
            bool executed,
            bool canceled,
            address proposer
        )
    {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.executed,
            proposal.canceled,
            proposal.proposer
        );
    }
}