const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const db = require('../db');

const validateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await db.query(
            'SELECT * FROM users WHERE wallet_address = $1',
            [decoded.walletAddress]
        );

        if (user.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user.rows[0];
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

const generateToken = (walletAddress) => {
    return jwt.sign(
        { walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const verifySignature = async (message, signature, walletAddress) => {
    try {
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

module.exports = {
    validateToken,
    generateToken,
    verifySignature
};