// Example: Inline Struct
import { BCS, getSuiMoveConfig, fromHEX, fromB64, fromB58 } from '@mysten/bcs';
const bcs = new BCS(getSuiMoveConfig());
// Some value we want to serialize
const coin = {
  id: '0000000000000000000000000000000000000000000000000000000000000005',
  value: 1111333333222n,
};

// Instead of defining a type we pass struct schema as the first argument
let coin_bytes = bcs.ser({ id: BCS.ADDRESS, value: BCS.U64 }, coin).toBytes();

// Same with deserialization
let coin_restored = bcs.de({ id: BCS.ADDRESS, value: BCS.U64 }, coin_bytes);

// console.log(coin_bytes);
// console.log(coin_restored);

const address =
  '0000000000000000000000000000000000000000000000000000000000000005';

// Instead of defining a type we pass struct schema as the first argument
let address_bytes = bcs.ser(BCS.ADDRESS, address).toBytes();

// Same with deserialization
let address_restored = bcs.de(BCS.ADDRESS, address_bytes);

// console.log(address_bytes);
// console.log(address_restored);

const data =
  '0a000000000000000003010000000000000003000000000000000400000000000000';
const data_bytes = Buffer.from(data, 'hex');
// Instead of defining a type we pass struct schema as the first argument
// let data_bytes = bcs.ser(BCS.STRING, byteArray).toBytes();

// Same with deserialization
let data_restored = bcs.de(BCS.U128, data_bytes);
console.log(data_bytes);

let test_data = fromHEX(data);
test_data = bcs.de('Order', fromHEX(data));
console.log(test_data);
