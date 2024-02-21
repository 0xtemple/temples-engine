import { Network } from '../../types';
export const defaultGasBudget = 10 ** 8; // 0.1 APTOS, should be enough for most of the transactions
export const defaultGasPrice = 1000; // 1000 MIST

/**
 * @description Get the default fullnode and faucet url for the given network type
 * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
 * @returns { fullNode: string, faucet?: string }
 */
export const getDefaultURL = (networkType: Network = Network.TESTNET) => {
  switch (networkType) {
    case Network.LOCAL:
      return {
        fullNode: 'ws://127.0.0.1:9944',
        // faucet: 'http://127.0.0.1:8081',
      };
    case Network.TESTNET:
      return {
        fullNode: 'wss://testnet.vara.network',
        // faucet: 'https://faucet.testnet.aptoslabs.com',
      };
    case Network.MAINNET:
      return {
        fullNode: 'wss://rpc.vara.network',
      };
    default:
      return {
        fullNode: 'wss://testnet.vara.network',
        // faucet: 'https://faucet.devnet.aptoslabs.com',
      };
  }
};
