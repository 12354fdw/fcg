import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { Players, CollectionService, ServerStorage } from "@rbxts/services";
import { EventBus } from "server/services/eventBus";
import { KeycardLevel } from "server/types/keycardTypes";
import { copySound } from "shared/copySound";

@Component({
	tag: "KeycardReader",
})
export class KeycardReader extends BaseComponent<{}, Model> implements OnStart {
	constructor(private eventBus: EventBus) {
		super();
	}

	onStart(): void {
		const model = this.instance;

		const config = model.WaitForChild("Configuration") as ModuleScript;
		const clearances = require(config) as KeycardLevel[];

		const sounds = ServerStorage.WaitForChild("Sounds").WaitForChild("KeycardReader");

		const hitbox = model.WaitForChild("hitbox") as BasePart;

		const soundSuccess = copySound(sounds.WaitForChild("success"), hitbox);
		const soundFailure = copySound(sounds.WaitForChild("failure"), hitbox);

		hitbox.Touched.Connect((keycard: Instance): void => {
			if (!CollectionService.HasTag(keycard, "Keycard")) return;

			const level = keycard.GetAttribute("KeycardLevel") as KeycardLevel;
			if (!clearances.includes(level) && level !== "Development") {
				soundFailure.Play();
				return;
			}

			const tool = keycard.Parent;
			const character = tool?.Parent as Model | undefined;
			if (!character) return;

			const player = Players.GetPlayerFromCharacter(character);
			if (!player) return;

			soundSuccess.Play();

			this.eventBus.KeycardEvents.Fire({
				Reader: this.instance,
				Player: player,
			});
		});
	}
}
