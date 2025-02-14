import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

async function testDpsnConnection() {
    const dpsnUrl = process.env.DPSN_URL;
    const pvtKey = process.env.WALLET_PVT_KEY;
    const rpcUrl = process.env.BASE_RPC_URL;
    const contractAddr = process.env.DPSN_CONTRACT_ADDR;
    const topicHash = process.env.GITHUB_TOPIC_HASH;

    if (!dpsnUrl) throw new Error('DPSN_URL is not defined');
    if (!pvtKey) throw new Error('WALLET_PVT_KEY is not defined');
    if (!rpcUrl) throw new Error('BASE_RPC_URL is not defined');
    if (!contractAddr) throw new Error('DPSN_CONTRACT_ADDR is not defined');
    if (!topicHash) throw new Error('GITHUB_TOPIC_HASH is not defined');

    console.log(' Initializing DPSN client...');
    console.log(' DPSN URL:', dpsnUrl);
    console.log('  Topic Hash:', topicHash);

    try {
        // Dynamically import the package
        const dpsnModule = await import('dpsn-client');

        if (!dpsnModule.default && !dpsnModule.DpsnClient) {
            throw new Error('DpsnClient not found in module exports');
        }

        const ClientConstructor = dpsnModule.default || dpsnModule.DpsnClient;
        const dpsnClient = new ClientConstructor(dpsnUrl, pvtKey, {
            wallet_chain_type: 'ethereum',
            network: 'testnet',
            isTestnet: true,
            isMainnet: false,
            rpcUrl: rpcUrl
        });

        dpsnClient.setContractAddress(contractAddr);

        // Set up connection handlers
        dpsnClient.onConnect((res: any) => {
            console.log(' Connected to DPSN!', res);
        });

        dpsnClient.onError((error: any) => {
            console.error(' DPSN Error:', error);
        });

        // Initialize connection
        await dpsnClient.init();
        console.log(' DPSN initialized successfully');

        // Subscribe to topic
        console.log(' Subscribing to topic:', topicHash);

        dpsnClient.subscribe(topicHash, (topic: any, message: any, packet: any) => {
            const timestamp = new Date().toISOString();
            console.log('\n Received repositories at ' + timestamp);

            if (!Array.isArray(message)) {
                console.error(' Error: Expected an array of repositories, but received:', typeof message);
                return;
            }

            if (message.length === 0) {
                console.error(' Error: Received an empty array of repositories');
                return;
            }

            const formattedRepos = message.map(repo => ({
                url: repo.url,
                description: repo.description,
                readmeUrl: repo.url.replace('github.com', 'raw.githubusercontent.com') + '/refs/heads/main/README.md'
            }));

            console.log('Found', formattedRepos.length, 'repositories:');
            console.log(JSON.stringify(formattedRepos, null, 2));
        });

        console.log(' Subscription active - waiting for messages...');
        console.log('Press Ctrl+C to stop\n');

        // Keep the process running
        await new Promise(() => {});
    } catch (error) {
        console.error(' Error:', error);
    }
}

testDpsnConnection().catch(console.error);
