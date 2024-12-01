const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

class UserController {
  async register(req, res) {
    try {
      const { name, email, password, walletAddress } = req.body;

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1 OR wallet_address = $2',
        [email, walletAddress]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, wallet_address) VALUES ($1, $2, $3, $4) RETURNING id, name, email, wallet_address',
        [name, email, hashedPassword, walletAddress]
      );

      // Generate JWT
      const token = jwt.sign(
        { userId: result.rows[0].id, walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: result.rows[0],
        token
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.wallet_address },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          walletAddress: user.wallet_address
        },
        token
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await db.query(`
        SELECT 
          u.id, u.name, u.email, u.wallet_address,
          json_agg(DISTINCT s.*) as skills,
          json_agg(DISTINCT p.*) as projects
        FROM users u
        LEFT JOIN user_skills us ON u.id = us.user_id
        LEFT JOIN skills s ON us.skill_id = s.id
        LEFT JOIN project_participants pp ON u.id = pp.sme_id
        LEFT JOIN projects p ON pp.project_id = p.id
        WHERE u.id = $1
        GROUP BY u.id
      `, [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, skills } = req.body;

      await db.query('BEGIN');

      // Update user details
      if (name) {
        await db.query(
          'UPDATE users SET name = $1 WHERE id = $2',
          [name, userId]
        );
      }

      // Update skills
      if (skills) {
        // Remove existing skills
        await db.query(
          'DELETE FROM user_skills WHERE user_id = $1',
          [userId]
        );

        // Add new skills
        for (const skillId of skills) {
          await db.query(
            'INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2)',
            [userId, skillId]
          );
        }
      }

      await db.query('COMMIT');

      res.json({ success: true });
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Error updating profile:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();