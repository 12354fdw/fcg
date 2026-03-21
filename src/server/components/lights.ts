import { BaseComponent, Component } from "@flamework/components";
import { OnStart } from "@flamework/core";
import { ServerStorage } from "@rbxts/services";
import { EventBus } from "server/services/eventBus";
import { GridEvent } from "server/types/eventBusTypes";
import { copySound } from "shared/copySound";

abstract class BaseLight extends BaseComponent<{}, Model> implements OnStart {
	protected isOn = false;

	protected constructor(protected eventBus: EventBus) {
		super();
	}

	protected setupSounds() {
		const sounds = ServerStorage.WaitForChild("Sounds").WaitForChild("Lights");
		copySound(sounds.WaitForChild("trip"), this.instance);
		copySound(sounds.WaitForChild("on"), this.instance);
	}

	abstract onStart(): void;
}

@Component({
	tag: "Light",
})
export class Lights extends BaseLight implements OnStart {
	constructor(eventBus: EventBus) {
		super(eventBus);
	}

	onStart(): void {
		const light = this.instance.FindFirstChildOfClass("SurfaceLight")!; // trust me it totally exists
		this.setupSounds();

		const trip = this.instance.WaitForChild("trip") as Sound;
		const on = this.instance.WaitForChild("on") as Sound;

		this.eventBus.GridEvents.Connect((event: GridEvent) => {
			if (!this.isOn && event.BusA) {
				this.isOn = true;

				on.Play();
				light.Enabled = true;
			} else if (this.isOn && !event.BusA) {
				this.isOn = false;

				trip.Play();
				light.Enabled = false;
			}
		});
	}
}

@Component({
	tag: "ELight",
})
export class ELights extends BaseLight implements OnStart {
	constructor(eventBus: EventBus) {
		super(eventBus);
	}

	onStart(): void {
		const light = this.instance.FindFirstChildOfClass("SurfaceLight")!; // trust me it totally exists
		this.setupSounds();

		const trip = this.instance.WaitForChild("trip") as Sound;
		const on = this.instance.WaitForChild("on") as Sound;

		this.eventBus.GridEvents.Connect((event: GridEvent) => {
			if (!this.isOn && !event.BusA && event.EmergencyBus) {
				this.isOn = true;

				on.Play();
				light.Enabled = true;
			} else if (this.isOn && (event.BusA || !event.EmergencyBus)) {
				this.isOn = false;

				trip.Play();
				light.Enabled = false;
			}
		});
	}
}
