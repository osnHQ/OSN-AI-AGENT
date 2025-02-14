import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: DpsnClient } = require('dpsn-client');

import dotenv from "dotenv";
dotenv.config({path: '../../.env'});



const dpsnUrl = process.env.DPSN_URL;
const pvtKey = process.env.WALLET_PVT_KEY;
const rpcUrl = process.env.BASE_RPC_URL;
const contractAddr = process.env.DPSN_CONTRACT_ADDR;

if (!dpsnUrl) throw new Error('DPSN_URL is not defined in the environment variables');
if (!pvtKey) throw new Error('WALLET_PVT_KEY is not defined in the environment variables');
if (!rpcUrl) throw new Error('BASE_RPC_URL is not defined in the environment variables');
if (!contractAddr) throw new Error('DPSN_CONTRACT_ADDR is not defined in the environment variables');


const dpsnService = new DpsnClient(dpsnUrl, pvtKey, {
    wallet_chain_type: 'ethereum',
    network: 'testnet',
    isTestnet: true,
    isMainnet: false,
    rpcUrl: rpcUrl
});

dpsnService.setContractAddress(contractAddr);

dpsnService.onConnect((res: any) => {
    console.log("[ON CONNECT LOG]", res);
});

dpsnService.onError((error: any) => {
    console.log("[ERROR LOG]", error);
});

export { dpsnService };