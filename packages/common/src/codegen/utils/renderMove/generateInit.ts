import { ObeliskConfig } from "../../types";
import { formatAndWriteMove } from "../formatAndWrite";
import {
  getRegisterSchema,
  getUseSchema,
  capitalizeFirstLetter,
} from "./common";

export function generateInit(config: ObeliskConfig, srcPrefix: string) {
  let code = `module ${config.name}::init {
    use std::ascii::string;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use ${config.name}::world;
${getUseSchema(config.name, config.schemas).join("\n")}

    fun init(ctx: &mut TxContext) {
        let (_obelisk_world, admin_cap) = world::create(string(b"${capitalizeFirstLetter(
          config.name
        )}"), string(b"${capitalizeFirstLetter(config.description)}"),ctx);

        // Add Schema
${getRegisterSchema(config.schemas).join("\n")}

        transfer::public_share_object(_obelisk_world);
        transfer::public_transfer(admin_cap, tx_context::sender(ctx));
    }

    #[test_only]
    public fun init_world_for_testing(ctx: &mut TxContext){
        init(ctx)
    }
}
`;
  formatAndWriteMove(
    code,
    `${srcPrefix}/contracts/${config.name}/sources/codegen/init.move`,
    "formatAndWriteMove"
  );
}
