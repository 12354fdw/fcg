import { Component } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { Door } from "./baseDoor";
import { KeycardEvent } from "server/types/eventBusTypes";
import { OnStart } from "@flamework/core";

interface TwoDoorKeycardConfiguration {
	L_Door: BasePart;
	R_Door: BasePart;

	Reader: Model[];

	Time: number;

	L_Closed: BasePart;
	L_Opened: BasePart;

	R_Closed: BasePart;
	R_Opened: BasePart;

	AutoClose: boolean;
	AutoCloseDelay: number;
}

@Component({
	tag: "2DoorKeycardDoor",
})
export class TwoDoorKeycardDoor extends Door<TwoDoorKeycardConfiguration> implements OnStart {
	constructor(eventBus: EventBus) {
		super(eventBus);
	}

	private handleEvent(event: KeycardEvent) {
		const config = this.configuration;

		// check if correct keycard reader
		if (!config.Reader.includes(event.Reader)) return;

		if (this.busy) return;

		if (this.state === "closed") {
			this.moveDoor(config.L_Door, config.L_Opened, "opened", false);
			this.moveDoor(config.R_Door, config.R_Opened, "opened");

			if (config.AutoClose) {
				task.wait(config.AutoCloseDelay);

				this.moveDoor(config.L_Door, config.L_Closed, "closed", false);
				this.moveDoor(config.R_Door, config.R_Closed, "closed");
			}
		} else if (this.state === "opened" && !config.AutoClose) {
			this.moveDoor(config.L_Door, config.L_Closed, "closed", false);
			this.moveDoor(config.R_Door, config.R_Closed, "closed");
		}
	}

	onStart(): void {
		const configModule = require(this.instance.WaitForChild("Configuration") as ModuleScript);
		this.configuration = configModule as TwoDoorKeycardConfiguration;

		this.eventBus.KeycardEvents.Connect((event: KeycardEvent) => {
			this.handleEvent(event);
		});
	}
}
