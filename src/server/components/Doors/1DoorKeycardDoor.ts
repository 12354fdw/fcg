import { Component } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { Door } from "./baseDoor";
import { KeycardEvent } from "server/types/eventBusTypes";
import { OnStart } from "@flamework/core";

interface OneDoorKeycardConfiguration {
	Door: BasePart;

	Reader: Model[];

	Time: number;

	Closed: BasePart;
	Opened: BasePart;

	AutoClose: boolean;
	AutoCloseDelay: number;
}

@Component({
	tag: "1DoorKeycardDoor",
})
export class OneDoor extends Door<OneDoorKeycardConfiguration> implements OnStart {
	constructor(eventBus: EventBus) {
		super(eventBus);
	}

	private handleEvent(event: KeycardEvent) {
		const config = this.configuration;
		// check if correct keycard reader
		if (!config.Reader.includes(event.Reader)) return;

		if (this.state === "closed" && !this.busy) {
			this.moveDoor(config.Door, config.Opened, "opened");

			if (config.AutoClose) {
				task.wait(config.AutoCloseDelay);
				this.moveDoor(config.Door, config.Closed, "closed");
			}
		} else if (this.state === "opened" && !config.AutoClose && !this.busy) {
			this.moveDoor(config.Door, config.Closed, "closed");
		}
	}

	onStart(): void {
		const configModule = require(this.instance.WaitForChild("Configuration") as ModuleScript);
		this.configuration = configModule as OneDoorKeycardConfiguration;

		this.eventBus.KeycardEvents.Connect((event: KeycardEvent) => {
			this.handleEvent(event);
		});
	}
}
