import { BaseComponent } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { tween } from "./tween";

export abstract class Door<TConfig> extends BaseComponent {
	protected configuration!: TConfig;

	protected state: "opened" | "closed" = "closed";
	protected busy = false;

	constructor(protected eventBus: EventBus) {
		super();
	}

	protected moveDoor(door: BasePart, target: BasePart, targetState: "opened" | "closed", block: boolean = true) {
		const config = this.configuration as TConfig & { Time: number };

		this.busy = true;
		tween(door, target, config.Time, block);

		this.state = targetState;
		this.busy = false;
	}
}
