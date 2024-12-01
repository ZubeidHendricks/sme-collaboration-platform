const { create } = require('ipfs-http-client');
const { Buffer } = require('buffer');

class IPFSService {
  constructor() {
    this.ipfs = create({
      host: process.env.IPFS_HOST || 'ipfs.infura.io',
      port: process.env.IPFS_PORT || 5001,
      protocol: process.env.IPFS_PROTOCOL || 'https',
      headers: {
        authorization: `Basic ${Buffer.from(
          process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
        ).toString('base64')}`
      }
    });
  }

  async uploadFile(buffer, filename) {
    try {
      const file = {
        path: filename,
        content: buffer
      };

      const result = await this.ipfs.add(file);
      return {
        hash: result.cid.toString(),
        size: result.size
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data) {
    try {
      const buffer = Buffer.from(JSON.stringify(data));
      const result = await this.ipfs.add(buffer);
      return result.cid.toString();
    } catch (error) {
      console.error('IPFS JSON upload error:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  async getFile(hash) {
    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(hash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.error('IPFS retrieval error:', error);
      throw new Error('Failed to retrieve file from IPFS');
    }
  }
}

module.exports = new IPFSService();