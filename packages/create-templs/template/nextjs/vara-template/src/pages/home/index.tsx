import { BCS, loadMetadata, getSuiMoveConfig, Temples, TransactionBlock, TransactionResult } from '@0xtemple/client';
import { useWallet } from '@suiet/wallet-kit';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Value } from '../../jotai';
import { useRouter } from 'next/router';
import { NETWORK, PACKAGE_ID, WORLD_ID } from '../../chain/config';
import { obeliskConfig } from '../../../temples.config';

import { ConnectButton } from '@suiet/wallet-kit';

type data = {
  type: string;
  fields: Record<string, any>;
  hasPublicTransfer: boolean;
  dataType: 'moveObject';
};

const Home = () => {
  const router = useRouter();
  const wallet = useWallet();
  const [value, setValue] = useAtom(Value);

  const counter = async (wallet: any) => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    const temples = new Temples({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
    });
    const tx = new TransactionBlock();
    const world = tx.pure(WORLD_ID);
    const params = [world];
    (await temples.tx.counter_system.inc(tx, params, undefined, true)) as TransactionResult;
    const response = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });
    if (response.effects.status.status == 'success') {
      const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
      const temples = new Temples({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
      });

      const component_name = Object.keys(obeliskConfig.schemas)[0];
      const component_value = await temples.getEntity(WORLD_ID, component_name);
      setValue(component_value[0]);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const query_counter = async () => {
        const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
        const temples = new Temples({
          networkType: NETWORK,
          packageId: PACKAGE_ID,
          metadata: metadata,
        });
        // home component name
        const component_name = Object.keys(obeliskConfig.schemas)[0];
        const component_value = await temples.getEntity(WORLD_ID, component_name);
        setValue(component_value[0]);
      };
      query_counter();
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!wallet.connected) return;
    console.log('connected wallet name: ', wallet.name);
    console.log('account address: ', wallet.account?.address);
    console.log('account publicKey: ', wallet.account?.publicKey);
  }, [wallet.connected]);

  return (
    <div className="flex justify-between items-start">
      <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-6">
        {!wallet.connected ? (
          <ConnectButton />
        ) : (
          <>
            <div>
              <ConnectButton />
            </div>
            <div className="flex flex-col gap-6 mt-12">
              <div className="flex flex-col gap-4">
                First, fund this wallet from the Sui faucet:
                <div className="flex flex-col gap-6 text-2xl text-green-600 mt-6 ">Counter: {value}</div>
                <div className="flex flex-col gap-6">
                  <button
                    type="button"
                    className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      counter(wallet);
                    }}
                  >
                    Increment
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
