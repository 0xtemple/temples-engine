# Temples Client SDK

Temples is client agnostic: any client -- a browser, a game engine, or an ios/android app -- can implement the synchronization protocol and a client-side cache to replicate Store tables, along with the necessary infrastructure to send transactions to the World.

Currently we only support browsers, Node and the COCOS game engine.

## Getting Started

Before proceeding with the next steps, make sure you have deployed your own world contract via cli.

When the world contract is deployed successfully, it will return a PackageId (the contract's ObjectId) and a WorldId (the World Store's ObjectId).

### Data preparation

We create a Project called Counter and declare sigleton schema called counter, which is of type `u64` and has an initial value of `0`.


```typescript
import { TempleConfig } from '@0xtempl/common';

export const obeliskConfig = {
  name: 'counter',
  description: 'counter',
  systems: ['counter_system'],
  schemas: {
    counter: {
      valueType: 'u64',
      defaultValue: 0,
    },
  },
  sample_schema: 'u64',
} as TempleConfig;
```

Through the CLI, we will generate the corresponding contract based on temples.config.ts At this point we need to write the system logic.

```bash
temples schemagen temples.config.ts
```

The next step is simply to write the system file method.

```rust
// contracts/counter/system/counter_system.move
module counter::counter_system {
    use counter::world::World;
    use counter::counter_schema;

    public entry fun inc(world: &mut World){
        let value = counter_schema::get(world) + 1;
        counter_schema::set(world,value);
    }
}
```

Finally we deploy the complete contract to devnet


```bash
temples publish --network devnet --configPath temples.config.ts
```

We'll get the `packageId` and `worldId` on the command line.

### Init Temples Client

```typescript
import { getMetadata, Temples, NetworkType } from "@0xtempl/client";

const network = "devnet" as NetworkType
const packageId = "0x804578b9eed47d461bba52c393cf148302819e2ba0a0f558356cc419b3e941ed"

const metadata = await getMetadata(network, packageId);

const temples = new Temples({
    networkType: network,
    packageId: packageId,
    metadata: metadata,
    secretKey: privkey
});
```

### World Tx

If you need to call a method in the system, you can do so using the `temples.tx.moudleName.funcName()` form.

```typescript
import { getMetadata, Temples, TransactionBlock } from "@0xtempl/client";

const metadata = await getMetadata(network, packageId);

const temples = new Temples({
    networkType: network,
    packageId: packageId,
    metadata: metadata,
    secretKey: privkey
});

// Initiate transactions through the account set up by temples
const tx = new TransactionBlock()

const world = tx.pure(WORLD_ID)
const params = [
    world,
]

const res_tx = await temples.tx.counter_system.inc(tx, params)

// If you want to encapsulate the TransactionBlock
const tx = new TransactionBlock()
const world = tx.pure(WORLD_ID)
const params = [
    world,
]
// By isolating the signature from the transactionBlock construction in this way,
// the front-end wallet plugin can signAndSend() directly to the transactionBlock,
// facilitating front-end interaction.
const new_tx = await temples.tx.counter_system.inc(tx, params, undefined, true) as TransactionBlock;

const response = await temples.signAndSendTxn(
    new_tx
)
```

### World Query

#### Query public contract view func

If your system method provides a method with no modification status and a return, then you can query it via `temples.query.moudleName.funcName()`.

```typescript
const metadata = await getMetadata(NETWORK, PACKAGE_ID);
const temples = new Temples({
    networkType: NETWORK,
    packageId: PACKAGE_ID,
    metadata: metadata,
});

const tx = new TransactionBlock()
const world = tx.pure(WORLD_ID)
const params = [
    world,
]
const query_value = await temples.query.counter_system.get(tx, params);
```

#### Get world

Queries the Object information of worldId.

```typescript
    const metadata = await getMetadata(NETWORK, PACKAGE_ID);
    const temples = new Temples({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
    });
    const world_value = await temples.getWorld(WORLD_ID)
```


#### List schema names

List all schema name in the world store.

```typescript
const metadata = await getMetadata(NETWORK, PACKAGE_ID);
const temples = new Temples({
    networkType: NETWORK,
    packageId: PACKAGE_ID,
    metadata: metadata,
});
const schemaNames = await temples.listSchemaNames(
  '0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0'
);
```


#### Get entity

Get the entity's data based on schema name and entity id(option).

```typescript
const metadata = await getMetadata(NETWORK, PACKAGE_ID);
const temples = new Temples({
    networkType: NETWORK,
    packageId: PACKAGE_ID,
    metadata: metadata,
});

const worldId = "0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0";

// get schema entity data
const schemaName = "simple_schema"
const entityId = "0x00000000000000000000000000000000000000000000000000000000000003ed"
const entities = await temples.getEntity(
    worldId,
    schemaName,
    entityId
);

// get singleton schema entity data
const singletonSchemaName = "counter"
const entities = await temples.getEntity(
    worldId,
    singletonSchemaName
);

```


#### Contain entity

Determine if the entity exists

```typescript
const metadata = await getMetadata(NETWORK, PACKAGE_ID);
const temples = new Temples({
    networkType: NETWORK,
    packageId: PACKAGE_ID,
    metadata: metadata,
});

const worldId = "0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0";

// get schema entity data
const schemaName = "simple_schema"
const entityId = "0x00000000000000000000000000000000000000000000000000000000000003ed"
const entities = await temples.containEntity(
    worldId,
    schemaName,
    entityId
);

// get singleton schema entity data
const singletonSchemaName = "counter"
const entities = await temples.containEntity(
    worldId,
    singletonSchemaName
);

```

#### Get owned objects

Query all the objects under the current worldId that are owned by a certain address.

```typescript
const metadata = await getMetadata(NETWORK, PACKAGE_ID);
const temples = new Temples({
    networkType: NETWORK,
    packageId: PACKAGE_ID,
    metadata: metadata,
});

const owner = "0xfa99b5b0463fcfb7d0203c701a76da5eda21a96190eb1368ab36a437cc89195e";
const owned_objects_value = await temples.getOwnedObjects(owner);
```

### About entity key

You can customize how the key is generated in the system, but I recommend that you generate the entity key using the user's address or objectId as the associative data, as this will help you associate the generated entity with address/objectId. This will help you associate the generated entity with the user's address, and then you can quickly determine the creator of the entity by the user's address or objectId.

We provide three ways to convert entity keys, and of course you are welcome to contribute more entity key specifications.


```typescript
// Create key based on objectId.
// You can use the user's address as the entity key, 
// or you can use the Id of an object as the entity key.
//
// For example: using the objectId of the NFT as the key, 
// you can set the owner of the nft as the owner of the accessed entity.
let objectAddress = await temples.entity_key_from_object(
    '0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0'
);

// hexAddress(keccak256(inputStringData))
let bytesAddress = await temples.entity_key_from_bytes('hello');

// hexAddress(inputNumberData)
let numberAddress = await temples.entity_key_from_u256(123);
```

