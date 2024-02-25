import {
  SubstrateExtrinsic,
  SubstrateEvent,
  SubstrateBlock,
} from "@subql/types";
import { GearApi, ProgramMetadata, HexString } from "@gear-js/api";
import { Transfer } from "../types";
import { ApiPromise, WsProvider } from "@polkadot/api";

// import { Balance } from "@polkadot/types/interfaces";
// import { decodeAddress } from "@polkadot/util-crypto";
type EventType = {
  destination: string;
  details: {
    code: { success: string };
    to: string;
  };
  id: string;
  payload: string;
  source: string;
  value: number;
};
export async function handleBlock(block: SubstrateBlock): Promise<void> {
  // Do something with each block handler here
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  // Do something with a call handler here
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  logger.info(
    `Examples Register ${event.block.block.header.number.toString()}`
  );

  // Get data from the event
  // The balances.transfer event has the following payload \[from, to, value\]
  // logger.info(JSON.stringify(event));
  // const {
  //   event: {
  //     data: [data],
  //   },
  // } = event;

  const eventData = event.event.data[0] as unknown as EventType;
  logger.info("---------------");
  logger.info(JSON.stringify(event));
  logger.info(JSON.stringify(eventData));
  logger.info(JSON.stringify(eventData.payload));
  logger.info("---------------");
  // const payloadJson = ProgramMetadata.from(payload.toString());
  // logger.info(payloadJson);
  // logger.info(payloadJson.getAllTypes());
  // logger.info("--------------- 11");

  const blockNumber: number = event.block.block.header.number.toNumber();

  // const fromAccount = await checkAndGetAccount(from.toString(), blockNumber);
  // const toAccount = await checkAndGetAccount(to.toString(), blockNumber);

  // Create the new transfer entity
  // const transfer = Transfer.create({
  //   id: `${event.block.block.header.number.toNumber()}-${event.idx}`,
  //   blockNumber,
  //   date: event.block.timestamp,
  // });

  // await Promise.all([transfer.save()]);
}

// async function checkAndGetAccount(
//   id: string,
//   blockNumber: number
// ): Promise<Account> {
//   let account = await Account.get(id.toLowerCase());
//   if (!account) {
//     // We couldn't find the account
//     account = Account.create({
//       id: id.toLowerCase(),
//       publicKey: decodeAddress(id).toString().toLowerCase(),
//       firstTransferBlock: blockNumber,
//     });
//   }
//   return account;
// }
