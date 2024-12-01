import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, Shield, AlertCircle } from 'lucide-react';
import web3Service from '../../services/web3Service';

const WalletConnect = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await web3Service.initialize();
      const address = await web3Service.getAddress();
      
      // Sign message for authentication
      const message = `Sign this message to authenticate with SME Platform: ${Date.now()}`;
      const signature = await web3Service.signMessage(message);
      
      onConnect({ address, signature, message });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <span>Connect Your Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Web3 wallet to access the SME Collaboration Platform.
          </p>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}
          
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wallet className="w-5 h-5" />
            <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect;