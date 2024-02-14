import { SuiMoveNormalizedModules } from '@mysten/sui.js/client';
import { getFullnodeUrl } from '@mysten/sui.js/client';

import { SuiInteractor } from '../libs/suiInteractor';

import { NetworkType } from '../types';

export async function loadMetadata(
  networkType: NetworkType,
  packageId: string
) {
  // Init the rpc provider
  const fullnodeUrls = [getFullnodeUrl(networkType)];
  const suiInteractor = new SuiInteractor(fullnodeUrls);
  if (packageId !== undefined) {
    const jsonData = await suiInteractor.getNormalizedMoveModulesByPackage(
      packageId
    );

    return jsonData as SuiMoveNormalizedModules;
  } else {
    console.error('please set your package id.');
  }
}
