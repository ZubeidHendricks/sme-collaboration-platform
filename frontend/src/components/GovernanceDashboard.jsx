import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Check, X, Clock, AlertTriangle } from 'lucide-react';

const ProposalCard = ({ proposal, onVote }) => {
  const timeLeft = Math.max(0, Math.floor((proposal.endTime - Date.now()) / 1000 / 3600));
  const totalVotes = proposal.forVotes + proposal.againstVotes;
  const forPercentage = totalVotes > 0 ? (proposal.forVotes / totalVotes) * 100 : 0;

  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{proposal.title}</span>
          <span className={`text-sm px-3 py-1 rounded-full ${
            proposal.executed ? 'bg-green-100 text-green-800' :
            proposal.canceled ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {proposal.executed ? 'Executed' :
             proposal.canceled ? 'Canceled' :
             `${timeLeft}h left`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{proposal.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Votes</span>
            <span className="text-sm">{forPercentage.toFixed(1)}% in favor</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${forPercentage}%` }}
            />
          </div>
        </div>

        {!proposal.executed && !proposal.canceled && !proposal.hasVoted && (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onVote(proposal.id, true)}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Support
            </button>
            <button
              onClick={() => onVote(proposal.id, false)}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Against
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GovernanceDashboard = () => {
  const [proposals, setProposals] = useState([]);
  const [newProposal, setNewProposal] = useState({ title: '', description: '' });

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    // Implement proposal creation
  };

  const handleVote = async (proposalId, support) => {
    // Implement voting
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Governance Dashboard</h1>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Proposal</h2>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border rounded"
                  rows={4}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Submit Proposal
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Proposals</h2>
        {proposals.map(proposal => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  );
};

export default GovernanceDashboard;