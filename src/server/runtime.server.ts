import { Flamework } from "@flamework/core";
import { Lighting } from "@rbxts/services";

Flamework.addPaths("src/server/components");
Flamework.addPaths("src/server/services");
Flamework.addPaths("src/shared/components");

Flamework.ignite();

$info("flamework ignited");
