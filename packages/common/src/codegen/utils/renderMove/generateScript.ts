import { ObeliskConfig } from "../../types";
import { formatAndWriteMove } from "../formatAndWrite";
import { existsSync } from "fs";

export function generateScript(config: ObeliskConfig, srcPrefix: string) {
    if (
        !existsSync(
            `${srcPrefix}/contracts/${config.name}/sources/script/deploy_hook.move`
        )
    ) {
        let code = `module ${config.name}::deploy_hook {
    use ${config.name}::world::{World, AdminCap, get_admin};
    use sui::object;

    /// Not the right admin for this world
    const ENotAdmin: u64 = 0;

    public entry fun run(world: &mut World, admin_cap: &AdminCap) {
        assert!( get_admin(world) == object::id(admin_cap), ENotAdmin);
        
        // Logic that needs to be automated once the contract is deployed
        
    }

    #[test_only]
    public fun deploy_hook_for_testing(world: &mut World, admin_cap: &AdminCap){
        run(world, admin_cap)
    }
}
`;
        formatAndWriteMove(
            code,
            `${srcPrefix}/contracts/${config.name}/sources/script/deploy_hook.move`,
            "formatAndWriteMove"
        );
    }
}
