// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReputationSystem {
    struct Rating {
        uint256 score;
        string comment;
        uint256 timestamp;
    }
    
    struct SMEReputation {
        uint256 totalScore;
        uint256 ratingCount;
        mapping(address => Rating[]) receivedRatings;
        uint256[] skillScores;
        bool isVerified;
    }
    
    mapping(address => SMEReputation) public reputations;
    mapping(address => bool) public verifiers;
    
    event RatingSubmitted(address indexed from, address indexed to, uint256 score);
    event SkillVerified(address indexed sme, uint256 skillId);
    
    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Not authorized verifier");
        _;
    }
    
    function submitRating(address _sme, uint256 _score, string memory _comment) external {
        require(_score >= 1 && _score <= 5, "Invalid score range");
        require(_sme != msg.sender, "Cannot rate self");
        
        SMEReputation storage rep = reputations[_sme];
        rep.totalScore += _score;
        rep.ratingCount += 1;
        
        rep.receivedRatings[msg.sender].push(Rating({
            score: _score,
            comment: _comment,
            timestamp: block.timestamp
        }));
        
        emit RatingSubmitted(msg.sender, _sme, _score);
    }
    
    function verifySkill(address _sme, uint256 _skillId) external onlyVerifier {
        SMEReputation storage rep = reputations[_sme];
        
        if (_skillId >= rep.skillScores.length) {
            rep.skillScores.push(100);
        } else {
            rep.skillScores[_skillId] = 100;
        }
        
        emit SkillVerified(_sme, _skillId);
    }
    
    function getReputation(address _sme) external view returns (
        uint256 averageScore,
        uint256 ratingCount,
        bool isVerified
    ) {
        SMEReputation storage rep = reputations[_sme];
        
        if (rep.ratingCount == 0) {
            return (0, 0, rep.isVerified);
        }
        
        averageScore = (rep.totalScore * 100) / rep.ratingCount;
        return (averageScore, rep.ratingCount, rep.isVerified);
    }
    
    function getSkillScore(address _sme, uint256 _skillId) external view returns (uint256) {
        SMEReputation storage rep = reputations[_sme];
        require(_skillId < rep.skillScores.length, "Skill not found");
        return rep.skillScores[_skillId];
    }
}