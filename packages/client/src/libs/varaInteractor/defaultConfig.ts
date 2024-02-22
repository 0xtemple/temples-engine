import { Network } from '../../types';

/**
 * @description Get the default fullnode and faucet url for the given network type
 * @param networkType, 'testnet' | 'mainnet' | 'localnet', default is 'testnet'
 * @returns { fullNode: string, faucet?: string }
 */
export const getDefaultURL = (networkType: Network = Network.TESTNET) => {
  switch (networkType) {
    case Network.LOCAL:
      return {
        ws: 'ws://127.0.0.1:9944',
        http: 'http://127.0.0.1:9933',
      };
    case Network.TESTNET:
      return {
        ws: 'wss://testnet.vara.network',
        http: 'https://testnet.vara.network',
      };
    case Network.MAINNET:
      return {
        ws: 'wss://rpc.vara.network',
        http: 'https://rpc.vara.network',
      };
    default:
      return {
        ws: 'wss://testnet.vara.network',
        http: 'https://testnet.vara.network',
      };
  }
};
