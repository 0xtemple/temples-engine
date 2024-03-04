import { Temples } from '@0xtemple/client';
import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Value } from '../../jotai';
import { useRouter } from 'next/router';
import { NETWORK, PACKAGE_ID, METADATA } from '../../chain/config';
import { templeConfig } from '../../../temple.config';
import { PRIVATEKEY } from '../../chain/key';
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const Home = () => {
  const router = useRouter();
  const [value, setValue] = useAtom(Value);

  const counter = async () => {
    const temples = new Temples({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: METADATA,
      mnemonics: PRIVATEKEY,
      connectWs: true,
    });
    console.log(METADATA);
    console.log(temples.getAllTypes());
    await temples.tx.contract.Add();
    await delay(2000);
    const component_value = await temples.query.contract.GetCurrentNumber();
    console.log(component_value);
    setValue(component_value['CurrentNumber']);
  };

  useEffect(() => {
    if (router.isReady) {
      const query_counter = async () => {
        const temples = new Temples({
          networkType: NETWORK,
          packageId: PACKAGE_ID,
          metadata: METADATA,
          connectWs: true,
        });
        const component_value = await temples.query.contract.GetCurrentNumber();
        console.log(component_value);
        setValue(component_value['CurrentNumber']);
      };
      query_counter();
    }
  }, [router.isReady]);
  return (
    <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8 flex-6">
      <div className="flex flex-col gap-6 mt-12">
        <div className="flex flex-col gap-4">
          You account already have some vara from localnet
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
