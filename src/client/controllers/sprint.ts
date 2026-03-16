import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { Events } from "client/network";

@Controller({})
export class SprintController implements OnStart {
	onStart(): void {
		UserInputService.InputBegan.Connect((input: InputObject, gameProcessedEvent: boolean) => {
			if (gameProcessedEvent) return;

			if (input.KeyCode === Enum.KeyCode.LeftShift || input.KeyCode === Enum.KeyCode.RightShift) {
				Events.sprint.fire(true);
			}
		});

		//

		UserInputService.InputEnded.Connect((input: InputObject, gameProcessedEvent: boolean) => {
			if (gameProcessedEvent) return;

			if (input.KeyCode === Enum.KeyCode.LeftShift || input.KeyCode === Enum.KeyCode.RightShift) {
				Events.sprint.fire(false);
			}
		});
	}
}
