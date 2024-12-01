const concurrently = require('concurrently');

concurrently([
  { command: 'npx hardhat node', name: 'chain', prefixColor: 'yellow' },
  { command: 'sleep 5 && npx hardhat run scripts/deploy.js --network localhost', name: 'deploy', prefixColor: 'green' },
  { command: 'sleep 10 && npm run dev:backend', name: 'backend', prefixColor: 'blue' },
  { command: 'sleep 15 && npm run dev:frontend', name: 'frontend', prefixColor: 'magenta' },
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});