const ipfsService = require('../services/ipfsService');
const db = require('../db');

class IPFSController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const result = await ipfsService.uploadFile(req.file.buffer, req.file.originalname);
      
      // Store file reference in database
      await db.query(
        'INSERT INTO documents (hash, name, size, mime_type, uploaded_by) VALUES ($1, $2, $3, $4, $5)',
        [result.hash, req.file.originalname, req.file.size, req.file.mimetype, req.user.id]
      );

      res.json(result);
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getFile(req, res) {
    try {
      const { hash } = req.params;
      
      // Check if file exists in database
      const doc = await db.query('SELECT * FROM documents WHERE hash = $1', [hash]);
      if (doc.rows.length === 0) {
        return res.status(404).json({ error: 'File not found' });
      }

      const buffer = await ipfsService.getFile(hash);
      res.send(buffer);
    } catch (error) {
      console.error('Error fetching from IPFS:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new IPFSController();