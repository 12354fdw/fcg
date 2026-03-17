import { Service } from "@flamework/core";
import Signal from "@rbxts/signal";
import { GridEvent, KeycardEvent } from "server/types/eventBusTypes";

@Service({})
export class EventBus {
	public readonly KeycardEvents = new Signal<(event: KeycardEvent) => void>();
	public readonly GridEvents = new Signal<(event: GridEvent) => void>();
}
