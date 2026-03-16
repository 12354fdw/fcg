import { Networking } from "@flamework/networking";

interface C2SEvents {
	sprint(enabled: boolean): void;
}

interface S2CEvents {}

export const GlobalEvents = Networking.createEvent<C2SEvents, S2CEvents>();
