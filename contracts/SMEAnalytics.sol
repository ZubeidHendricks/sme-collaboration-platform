// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SMEAnalytics {
    struct ProjectMetrics {
        uint256 totalValue;
        uint256 completedCount;
        uint256 averageTeamSize;
        uint256 successRate;
    }

    struct SMEMetrics {
        uint256 projectsParticipated;
        uint256 totalEarnings;
        uint256 averageRating;
        uint256 completionRate;
    }

    mapping(address => SMEMetrics) public smeMetrics;
    ProjectMetrics public platformMetrics;

    event MetricsUpdated(address indexed sme);

    function updateProjectMetrics(
        uint256 _value,
        uint256 _teamSize,
        bool _successful
    ) external {
        platformMetrics.totalValue += _value;
        platformMetrics.averageTeamSize = 
            (platformMetrics.averageTeamSize + _teamSize) / 2;
        
        if (_successful) {
            platformMetrics.completedCount++;
            platformMetrics.successRate = 
                (platformMetrics.completedCount * 100) / platformMetrics.totalValue;
        }
    }

    function updateSMEMetrics(
        address _sme,
        uint256 _earnings,
        uint256 _rating,
        bool _completed
    ) external {
        SMEMetrics storage metrics = smeMetrics[_sme];
        metrics.projectsParticipated++;
        metrics.totalEarnings += _earnings;
        metrics.averageRating = 
            (metrics.averageRating + _rating) / 2;
        
        if (_completed) {
            metrics.completionRate = 
                (metrics.completionRate + 100) / metrics.projectsParticipated;
        }

        emit MetricsUpdated(_sme);
    }

    function getSMEMetrics(address _sme) 
        external 
        view 
        returns (SMEMetrics memory) 
    {
        return smeMetrics[_sme];
    }

    function getPlatformMetrics() 
        external 
        view 
        returns (ProjectMetrics memory) 
    {
        return platformMetrics;
    }
}