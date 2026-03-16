import { OnStart, Service } from "@flamework/core";
import { Events } from "server/network";

@Service({})
export class SprintService implements OnStart {
	onStart(): void {
		Events.sprint.connect((player: Player, enabled: boolean) => {
			this.setSprint(player, enabled);
		});
	}

	private setSprint(player: Player, enabled: boolean) {
		const character = player.Character;
		if (!character) return; // a lil bit concerning

		const humanoid = character.FindFirstChild("Humanoid") as Humanoid | undefined;
		if (!humanoid) {
			$error(`'${player.Name}' doesn't have a Humanoid!`); // what the hell
			return;
		}

		humanoid.WalkSpeed = enabled ? 35 : 16;
	}
}
