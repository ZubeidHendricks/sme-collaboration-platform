const { ethers } = require('ethers');
const ProjectContract = require('../contracts/ProjectManagement.json');
const db = require('../db');
const ipfsService = require('../services/ipfsService');

class ProjectController {
  async createProject(req, res) {
    try {
      const { name, description, budget, deadline, teamSize, skills, documents } = req.body;
      const userId = req.user.id;

      // Upload documents to IPFS
      let documentHashes = [];
      if (documents && documents.length > 0) {
        documentHashes = await Promise.all(
          documents.map(doc => ipfsService.uploadFile(doc.buffer, doc.originalname))
        );
      }

      // Store in database
      const project = await db.query(
        'INSERT INTO projects (name, description, budget, deadline, team_size, owner_id, ipfs_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [name, description, budget, deadline, teamSize, userId, documentHashes[0]]
      );

      // Create project on blockchain
      const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(process.env.PROJECT_CONTRACT_ADDRESS, ProjectContract.abi, wallet);

      const tx = await contract.createProject(
        name,
        description,
        ethers.utils.parseEther(budget.toString()),
        Math.floor(new Date(deadline).getTime() / 1000),
        teamSize
      );
      await tx.wait();

      res.json({ success: true, projectId: project.rows[0].id });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getProjects(req, res) {
    try {
      const projects = await db.query(
        `SELECT p.*, u.name as owner_name, 
         array_agg(ps.skill_name) as skills,
         count(pp.sme_id) as current_team_size
         FROM projects p
         LEFT JOIN users u ON p.owner_id = u.id
         LEFT JOIN project_skills ps ON p.id = ps.project_id
         LEFT JOIN project_participants pp ON p.id = pp.project_id
         WHERE p.status != 'CANCELLED'
         GROUP BY p.id, u.name
         ORDER BY p.created_at DESC`
      );

      res.json(projects.rows);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async joinProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      // Check if already participating
      const existing = await db.query(
        'SELECT * FROM project_participants WHERE project_id = $1 AND sme_id = $2',
        [projectId, userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already participating in project' });
      }

      // Add to participants
      await db.query(
        'INSERT INTO project_participants (project_id, sme_id, joined_at) VALUES ($1, $2, NOW())',
        [projectId, userId]
      );

      // Join on blockchain
      const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
      const contract = new ethers.Contract(process.env.PROJECT_CONTRACT_ADDRESS, ProjectContract.abi, wallet);

      const tx = await contract.joinProject(projectId);
      await tx.wait();

      res.json({ success: true });
    } catch (error) {
      console.error('Error joining project:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProjectController();