import { Service, OnStart } from "@flamework/core";
import { Players, ServerStorage } from "@rbxts/services";
import rankInformation, { KeycardLevel } from "server/types/keycardTypes";

@Service({})
export class KeycardGiver implements OnStart {
	private keycardFactory(player: Player, rank: KeycardLevel) {
		const info = rankInformation[rank];

		const template = ServerStorage.WaitForChild("KeycardTemplate").Clone() as Tool;
		template.Parent = player.WaitForChild("Backpack");

		const handle = template.WaitForChild("Handle") as BasePart;
		const gui = handle.WaitForChild("SurfaceGui") as SurfaceGui;

		template.Name = "Keycard";

		handle.SetAttribute("KeycardLevel", rank);

		handle.Color = info.Color;

		const number = gui.WaitForChild("number") as TextLabel;
		number.Text = info.Level;

		const level = gui.WaitForChild("background").WaitForChild("level") as TextLabel;
		level.Text = info.DisplayName;

		const name = gui.WaitForChild("contents").WaitForChild("Frame").WaitForChild("name") as TextLabel;
		name.Text = player.DisplayName;

		const playerLevel = gui.WaitForChild("contents").WaitForChild("Frame").WaitForChild("level") as TextLabel;
		playerLevel.Text = info.DisplayName;

		const picture = gui.WaitForChild("contents").WaitForChild("picture") as ImageLabel;

		picture.Image = `rbxthumb://type=AvatarHeadShot&id=${player.UserId}&w=420&h=420`;
		picture.BorderColor3 = info.Color;
	}

	onStart() {
		Players.PlayerAdded.Connect((player: Player) => {
			player.CharacterAdded.Connect(() => {
				if (player.GetRoleInGroup(33499464) === "senior developer") {
					this.keycardFactory(player, "Development");
				}

				// TODO: give proper role
				this.keycardFactory(player, "Admin");
				this.keycardFactory(player, "Security");
				this.keycardFactory(player, "ReactorOperators");
				this.keycardFactory(player, "ComputerScientist");
				this.keycardFactory(player, "LnM");
				this.keycardFactory(player, "None");
			});
		});
	}
}
