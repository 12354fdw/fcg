import { BaseComponent, Component } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { ElevatorDoor } from "../Doors/elevatorDoor";
import { OnStart } from "@flamework/core";
import { TeleportVolume } from "./teleportVolume";
import { copySound } from "shared/copySound";
import { ServerStorage } from "@rbxts/services";
import { ElevatorService } from "server/services/Elevator/elevatorService";
import { ShaftManager } from "server/services/Elevator/shaftManager";

interface Sounds {
	Moving: Sound;
	Ding: Sound;
	Doors: Sound;
}

@Component({
	tag: "Elevator",
})
export class ElevatorNode extends BaseComponent<{}, Model> implements OnStart {
	constructor(private eventBus: EventBus, private elevatorService: ElevatorService) {
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

	public readonly elevatorDoor: ElevatorDoor;
	public readonly teleportVolume: TeleportVolume;
	public readonly Sounds: Sounds;

	private shaftManager!: ShaftManager; // hopefully this won't cause a runtime error
	private invalidateClose: boolean = false;

	private getButton(name: string): ClickDetector {
		const buttons = this.instance.WaitForChild("Buttons");
		const button = buttons.WaitForChild(name);
		const detector = button.WaitForChild("button").WaitForChild("ClickDetector") as ClickDetector;
		return detector;
	}

	public attachManager(manager: ShaftManager) {
		this.shaftManager = manager;
	}

	private bindFloorButton(name: string) {
		this.getButton(name).MouseClick.Connect((player: Player) => {
			if (this.instance.Name === name) return;
			this.shaftManager.requestFloor(this, this.shaftManager.findNodeByName(name)!);
		});
	}

	public openNCloseDoors() {
		if (this.shaftManager.isBusy) return;
		this.shaftManager.isBusy = true;

		this.Sounds.Ding.Play();

		this.Sounds.Doors.Play();
		this.elevatorDoor.open();

		task.wait(10);
		if (this.invalidateClose) {
			this.invalidateClose = false;
			return;
		}

		this.Sounds.Doors.Play();
		this.elevatorDoor.close();

		this.shaftManager.isBusy = false;
	}

	onStart(): void {
		this.elevatorService.registerNode(this);

		this.bindFloorButton("G");
		this.bindFloorButton("1");

		this.getButton("call").MouseClick.Connect(() => {
			this.openNCloseDoors();
		});
		this.getButton("open").MouseClick.Connect(() => {
			this.openNCloseDoors();
		});

		this.getButton("close").MouseClick.Connect(() => {
			this.invalidateClose = true;

			this.shaftManager.isBusy = true;
			this.Sounds.Doors.Play();
			this.elevatorDoor.close();
			this.shaftManager.isBusy = false;
		});
	}
}
