import { OnStart, Service } from "@flamework/core";
import { GridEvent } from "server/types/eventBusTypes";
import { EventBus } from "./eventBus";

@Service({})
export class GridService implements OnStart {
	constructor(private eventBus: EventBus) {}

	private gridStatus: GridEvent = {
		EmergencyBus: true,
		BusA: true,
		externalGrid: true,

		syncedToGrid: false,
		generatorLoad: 0,

		demand: 67000,
	};

	onStart(): void {
		task.wait(1);
		this.eventBus.GridEvents.Fire(this.gridStatus);

		/*
		for (;;) {
			this.gridStatus.BusA = !this.gridStatus.BusA;
			this.eventBus.GridEvents.Fire(this.gridStatus);
			task.wait(1);
		}
		*/
	}
}
