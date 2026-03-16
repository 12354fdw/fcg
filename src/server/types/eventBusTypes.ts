export interface KeycardEvent {
	Reader: Model;
	Player: Player;
}

export interface GridEvent {
	// power status
	EmergencyBus: boolean;
	BusA: boolean;
	externalGrid: boolean; // for LOOP lol

	syncedToGrid: boolean;
	generatorLoad: number;

	demand: number;
}

export interface ElevatorOpenNCloseDoors {
	target: string;
}
