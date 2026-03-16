import { BaseComponent, Component } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { ElevatorDoor } from "../Doors/elevatorDoor";
import { OnStart } from "@flamework/core";
import { TeleportVolume } from "./teleportVolume";
import { copySound } from "shared/copySound";
import { ServerStorage, Workspace } from "@rbxts/services";
import { ElevatorOpenNCloseDoors } from "server/types/eventBusTypes";

interface Sounds {
	Moving: Sound;
	Ding: Sound;
	Doors: Sound;
}

@Component({
	tag: "Elevator",
})
export class Elevator extends BaseComponent<{}, Model> implements OnStart {
	constructor(private eventBus: EventBus) {
		super();

		this.elevatorDoor = new ElevatorDoor(eventBus, this.instance);
		this.teleportVolume = new TeleportVolume(this.instance.WaitForChild("TeleportationVolume") as Folder);

		const sounds = ServerStorage.WaitForChild("Sounds").WaitForChild("Elevator");
		this.Sounds = {
			Moving: copySound(sounds.WaitForChild("Moving"), this.instance.WaitForChild("floor")),
			Ding: copySound(sounds.WaitForChild("Ding"), this.instance.WaitForChild("floor")),
			Doors: copySound(sounds.WaitForChild("Doors"), this.instance.WaitForChild("floor")),
		};
	}

	private readonly elevatorDoor: ElevatorDoor;
	private readonly teleportVolume: TeleportVolume;
	private readonly Sounds: Sounds;

	isBusy: boolean = false;
	scheduledElevator: string = "";

	private getButton(name: string): ClickDetector {
		const buttons = this.instance.WaitForChild("Buttons");
		const button = buttons.WaitForChild(name);
		const detector = button.WaitForChild("button").WaitForChild("ClickDetector") as ClickDetector;
		return detector;
	}

	private openNCloseDoors() {
		if (this.isBusy) return;
		this.isBusy = true;

		this.Sounds.Ding.Play();

		this.Sounds.Doors.Play();
		this.elevatorDoor.open();

		task.wait(10);

		this.Sounds.Doors.Play();
		this.elevatorDoor.close();

		this.isBusy = false;

		task.wait(0.2);
		this.teleport(this.scheduledElevator);
	}

	private teleport(targetElevator: string) {
		if (this.isBusy) return;
		this.scheduledElevator = "";

		const target = Workspace.WaitForChild("Elevators")
			.FindFirstChild(targetElevator)
			?.FindFirstChild("TeleportationVolume") as Folder;

		if (!target) return;

		this.Sounds.Moving.Play();
		task.wait(3.71);

		const snapshot = this.teleportVolume.capture();
		TeleportVolume.teleport(target, snapshot);
		task.wait(0.2);

		this.eventBus.ElevatorOpenNCloseDoors.Fire({ target: targetElevator });
	}

	onStart(): void {
		this.getButton("Call").MouseClick.Connect((player: Player) => {
			this.openNCloseDoors();
		});

		this.getButton("Open").MouseClick.Connect((player: Player) => {
			this.openNCloseDoors();
		});

		this.getButton("G").MouseClick.Connect((player: Player) => {
			this.scheduledElevator = "G";
			this.teleport("G");
		});

		this.getButton("1").MouseClick.Connect((player: Player) => {
			this.scheduledElevator = "1";
			this.teleport("1");
		});

		this.eventBus.ElevatorOpenNCloseDoors.Connect((event: ElevatorOpenNCloseDoors) => {
			if (event.target !== this.instance.Name) return;
			this.openNCloseDoors();
		});
	}
}
