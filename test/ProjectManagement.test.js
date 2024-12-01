const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ProjectManagement', function () {
  let ProjectManagement;
  let Token;
  let project;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Deploy test token
    Token = await ethers.getContractFactory('TestToken');
    token = await Token.deploy('Test Token', 'TST', ethers.utils.parseEther('1000000'));
    await token.deployed();

    // Deploy project management contract
    ProjectManagement = await ethers.getContractFactory('ProjectManagement');
    project = await ProjectManagement.deploy(token.address);
    await project.deployed();

    [owner, addr1, addr2] = await ethers.getSigners();

    // Fund accounts with tokens
    await token.transfer(addr1.address, ethers.utils.parseEther('10000'));
    await token.transfer(addr2.address, ethers.utils.parseEther('10000'));
  });

  describe('Project Creation', function () {
    it('Should create a new project', async function () {
      const name = 'Test Project';
      const description = 'Test Description';
      const budget = ethers.utils.parseEther('1000');
      const deadline = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const teamSize = 3;

      await token.approve(project.address, budget);
      await project.createProject(name, description, budget, deadline, teamSize);

      const projectDetails = await project.getProjectDetails(0);
      expect(projectDetails.name).to.equal(name);
      expect(projectDetails.budget).to.equal(budget);
    });

    it('Should fail with invalid deadline', async function () {
      const deadline = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
      await expect(
        project.createProject('Test', 'Description', 1000, deadline, 2)
      ).to.be.revertedWith('Invalid deadline');
    });
  });

  describe('Project Participation', function () {
    beforeEach(async function () {
      await token.approve(project.address, ethers.utils.parseEther('1000'));
      await project.createProject(
        'Test Project',
        'Description',
        ethers.utils.parseEther('1000'),
        Math.floor(Date.now() / 1000) + 86400,
        2
      );
    });

    it('Should allow joining a project', async function () {
      await project.connect(addr1).joinProject(0);
      const projectDetails = await project.getProjectDetails(0);
      expect(await project.isParticipant(0, addr1.address)).to.be.true;
    });

    it('Should prevent double joining', async function () {
      await project.connect(addr1).joinProject(0);
      await expect(
        project.connect(addr1).joinProject(0)
      ).to.be.revertedWith('Already participating');
    });
  });

  describe('Project Completion', function () {
    beforeEach(async function () {
      await token.approve(project.address, ethers.utils.parseEther('1000'));
      await project.createProject(
        'Test Project',
        'Description',
        ethers.utils.parseEther('1000'),
        Math.floor(Date.now() / 1000) + 86400,
        2
      );
      await project.connect(addr1).joinProject(0);
      await project.connect(addr2).joinProject(0);
    });

    it('Should complete project when all vote', async function () {
      await project.connect(addr1).voteForCompletion(0);
      await project.connect(addr2).voteForCompletion(0);
      
      const projectDetails = await project.getProjectDetails(0);
      expect(projectDetails.status).to.equal(2); // Completed status
    });

    it('Should distribute payments on completion', async function () {
      const initialBalance = await token.balanceOf(addr1.address);
      
      await project.connect(addr1).voteForCompletion(0);
      await project.connect(addr2).voteForCompletion(0);
      
      const finalBalance = await token.balanceOf(addr1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });
});