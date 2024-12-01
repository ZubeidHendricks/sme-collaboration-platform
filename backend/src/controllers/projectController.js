const { ethers } = require('ethers');
const ProjectContract = require('../contracts/ProjectManagement.json');
const db = require('../db');
const ipfsService = require('../services/ipfsService');

class ProjectController {
  async createProject(req, res) {
    try {
      const { name, description, budget, deadline, teamSize, skills, documents } = req.body;
      const userId = req.user.id;

      // Upload documents to IPFS if provided
      let documentHashes = [];
      if (documents && documents.length > 0) {
        documentHashes = await Promise.all(
          documents.map(doc => ipfsService.uploadFile(doc.buffer, doc.originalname))
        );
      }

      // Store project metadata
      const projectMetadata = {
        name,
        description,
        documents: documentHashes,
        timestamp: Date.now()
      };

      // Upload metadata to IPFS
      const metadataHash = await ipfsService.uploadJSON(projectMetadata);

      // Create project in database
      const project = await db.query(
        'INSERT INTO projects (owner_id, name, description, budget, deadline, team_size, ipfs_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [userId, name, description, budget, deadline, teamSize, metadataHash]
      );

      // Store skills requirements
      for (const skillId of skills) {
        await db.query(
          'INSERT INTO project_required_skills (project_id, skill_id) VALUES ($1, $2)',
          [project.rows[0].id, skillId]
        );
      }

      res.status(201).json({
        success: true,
        projectId: project.rows[0].id,
        ipfsHash: metadataHash
      });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getProjects(req, res) {
    try {
      const projects = await db.query(`
        SELECT p.*, u.name as owner_name, 
        array_agg(DISTINCT s.name) as required_skills,
        count(DISTINCT pp.sme_id) as current_participants
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_required_skills prs ON p.id = prs.project_id
        LEFT JOIN skills s ON prs.skill_id = s.id
        LEFT JOIN project_participants pp ON p.id = pp.project_id
        WHERE p.status != 'CANCELLED'
        GROUP BY p.id, u.name
        ORDER BY p.created_at DESC
      `);

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

      // Check if user is already participating
      const existing = await db.query(
        'SELECT * FROM project_participants WHERE project_id = $1 AND sme_id = $2',
        [projectId, userId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Already participating in this project' });
      }

      // Add participant
      await db.query(
        'INSERT INTO project_participants (project_id, sme_id, role, status) VALUES ($1, $2, $3, $4)',
        [projectId, userId, 'MEMBER', 'ACTIVE']
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error joining project:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateProject(req, res) {
    try {
      const { projectId } = req.params;
      const { status, progress, updates } = req.body;
      const userId = req.user.id;

      // Verify user is project owner or participant
      const project = await db.query(
        'SELECT * FROM projects WHERE id = $1 AND (owner_id = $2 OR EXISTS (SELECT 1 FROM project_participants WHERE project_id = $1 AND sme_id = $2))',
        [projectId, userId]
      );

      if (project.rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized to update this project' });
      }

      // Update project status if provided
      if (status) {
        await db.query(
          'UPDATE projects SET status = $1 WHERE id = $2',
          [status, projectId]
        );
      }

      // Add project update if provided
      if (updates) {
        await db.query(
          'INSERT INTO project_updates (project_id, author_id, content) VALUES ($1, $2, $3)',
          [projectId, userId, updates]
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProjectController();