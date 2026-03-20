import { EventBus } from "server/services/eventBus";
import { Door } from "./baseDoor";

interface ElevatorDoorConfiguration {
	L1: BasePart;
	L2: BasePart;
	L3: BasePart;
	R1: BasePart;
	R2: BasePart;
	R3: BasePart;

	L1Close: BasePart;
	L2Close: BasePart;
	L3Close: BasePart;
	R1Close: BasePart;
	R2Close: BasePart;
	R3Close: BasePart;

	L1Open: BasePart;
	L2Open: BasePart;
	L3Open: BasePart;
	R1Open: BasePart;
	R2Open: BasePart;
	R3Open: BasePart;

	Time: number;
}

export class ElevatorDoor extends Door<ElevatorDoorConfiguration> {
	constructor(eventBus: EventBus, elevator: Model) {
		super(eventBus);

		const configModule = elevator.WaitForChild("Doors").WaitForChild("Configuration") as ModuleScript;
		this.configuration = require(configModule) as ElevatorDoorConfiguration;
	}

	public async open() {
		if (this.busy) return;

		const config = this.configuration;

		this.busy = true;
		this.moveDoor(config.L1, config.L1Open, "opened", false);
		this.moveDoor(config.L2, config.L2Open, "opened", false);
		this.moveDoor(config.L3, config.L3Open, "opened", false);

		this.moveDoor(config.R1, config.R1Open, "opened", false);
		this.moveDoor(config.R2, config.R2Open, "opened", false);
		this.moveDoor(config.R3, config.R3Open, "opened");
		this.busy = false;
	}

	public async close() {
		if (this.busy) return;

		const config = this.configuration;
		this.busy = true;

		this.moveDoor(config.L1, config.L1Close, "closed", false);
		this.moveDoor(config.L2, config.L2Close, "closed", false);
		this.moveDoor(config.L3, config.L3Close, "closed", false);

		this.moveDoor(config.R1, config.R1Close, "closed", false);
		this.moveDoor(config.R2, config.R2Close, "closed", false);
		this.moveDoor(config.R3, config.R3Close, "closed");
		this.busy = false;
	}
}
