import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { EventBus } from "server/services/eventBus";
import { GridEvent } from "server/types/eventBusTypes";

@Component({
	tag: "genericAppliances",
	instanceGuard: (instance): instance is Instance & { Enabled: boolean } => {
		return typeIs(instance, "Instance") && "Enabled" in instance;
	},
})
// just use Motor for Enabled property
export class genericAppliances extends BaseComponent<{}, Motor> implements OnStart {
	constructor(private eventBus: EventBus) {
		super();
	}

	onStart(): void {
		this.eventBus.GridEvents.Connect((event: GridEvent) => {
			this.instance.Enabled = event.BusA;
		});
	}
}
