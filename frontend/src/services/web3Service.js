import { ethers } from 'ethers';
import ProjectManagement from '../contracts/ProjectManagement.json';
import SMEGovernance from '../contracts/SMEGovernance.json';
import ReputationSystem from '../contracts/ReputationSystem.json';

class Web3Service {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.projectContract = null;
    this.governanceContract = null;
    this.reputationContract = null;
  }

  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = this.provider.getSigner();

    this.initializeContracts();
  }

  initializeContracts() {
    this.projectContract = new ethers.Contract(
      process.env.REACT_APP_PROJECT_CONTRACT_ADDRESS,
      ProjectManagement.abi,
      this.signer
    );

    this.governanceContract = new ethers.Contract(
      process.env.REACT_APP_GOVERNANCE_CONTRACT_ADDRESS,
      SMEGovernance.abi,
      this.signer
    );

    this.reputationContract = new ethers.Contract(
      process.env.REACT_APP_REPUTATION_CONTRACT_ADDRESS,
      ReputationSystem.abi,
      this.signer
    );
  }

  // Project Management Methods
  async createProject(name, description, budget, deadline, teamSize, skills) {
    try {
      const tx = await this.projectContract.createProject(
        name,
        description,
        ethers.utils.parseEther(budget.toString()),
        Math.floor(new Date(deadline).getTime() / 1000),
        teamSize,
        skills.map(skill => ethers.utils.formatBytes32String(skill))
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async getProjects() {
    try {
      const projectCount = await this.projectContract.projectCount();
      const projects = [];

      for (let i = 0; i < projectCount; i++) {
        const project = await this.getProjectDetails(i);
        if (project.isActive) {
          projects.push({ id: i, ...project });
        }
      }

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  async joinProject(projectId) {
    try {
      const tx = await this.projectContract.joinProject(projectId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error joining project:', error);
      throw error;
    }
  }

  // Governance Methods
  async createProposal(title, description, votingPeriod) {
    try {
      const tx = await this.governanceContract.createProposal(
        title,
        description,
        votingPeriod
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  }

  async getProposals() {
    try {
      const proposalCount = await this.governanceContract.proposalCount();
      const proposals = [];

      for (let i = 0; i < proposalCount; i++) {
        const proposal = await this.governanceContract.getProposalDetails(i);
        proposals.push({
          id: i,
          ...proposal,
          isActive: await this.governanceContract.isProposalActive(i)
        });
      }

      return proposals;
    } catch (error) {
      console.error('Error fetching proposals:', error);
      throw error;
    }
  }

  // Reputation Methods
  async submitRating(address, score, comment) {
    try {
      const tx = await this.reputationContract.submitRating(address, score, comment);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  async getReputation(address) {
    try {
      const reputation = await this.reputationContract.getReputation(address);
      return {
        averageScore: reputation.averageScore.toNumber() / 100,
        ratingCount: reputation.ratingCount.toNumber(),
        isVerified: reputation.isVerified
      };
    } catch (error) {
      console.error('Error fetching reputation:', error);
      throw error;
    }
  }
}

export default new Web3Service();