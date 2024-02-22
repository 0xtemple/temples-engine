import { loadMetadata, Temples, TransactionBlock, TransactionResult } from '@0xtempl/client';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Value } from '../../jotai';
import { useRouter } from 'next/router';
import { NETWORK, PACKAGE_ID, WORLD_ID } from '../../chain/config';
import { obeliskConfig } from '../../../temples.config';
import { PRIVATEKEY } from '../../chain/key';

const Home = () => {
  const router = useRouter();
  const [value, setValue] = useAtom(Value);

  const counter = async () => {
    const metadata = await loadMetadata(NETWORK, PACKAGE_ID);
    const temples = new Temples({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
      secretKey: PRIVATEKEY,
    });
    const tx = new TransactionBlock();
    const world = tx.pure(WORLD_ID);
    const params = [world];
    (await temples.tx.counter_system.inc(tx, params, undefined, true)) as TransactionResult;
    const response = await temples.signAndSendTxn(tx);
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
        // counter component name
        const component_name = Object.keys(obeliskConfig.schemas)[0];
        const component_value = await temples.getEntity(WORLD_ID, component_name);
        setValue(component_value[0]);
      };
      query_counter();
    }
  }, [router.isReady]);
  return (
    <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-6">
      <div className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col gap-4">
          You account already have some sui from localnet
          <div className="flex flex-col gap-6 text-2xl text-green-600 mt-6 ">Counter: {value}</div>
          <div className="flex flex-col gap-6">
            <button
              type="button"
              className="mx-auto px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                counter();
              }}
            >
              Increment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
