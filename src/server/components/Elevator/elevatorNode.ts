import { BaseComponent, Component } from "@flamework/components";
import { EventBus } from "server/services/eventBus";
import { ElevatorDoor } from "../Doors/elevatorDoor";
import { OnStart } from "@flamework/core";
import { TeleportVolume } from "./teleportVolume";
import { copySound } from "shared/copySound";
import { ServerStorage } from "@rbxts/services";
import { ElevatorService } from "server/services/Elevator/elevatorService";
import { ElevatorState, ShaftManager } from "server/services/Elevator/shaftManager";

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

	private shaftManager!: ShaftManager;

	//

	private getButton(name: string): ClickDetector {
		const buttons = this.instance.WaitForChild("Buttons");
		const button = buttons.WaitForChild(name);
		return button.WaitForChild("button").WaitForChild("ClickDetector") as ClickDetector;
	}

	public attachManager(manager: ShaftManager) {
		this.shaftManager = manager;
	}

	private bindFloorButton(name: string) {
		this.getButton(name).MouseClick.Connect(() => {
			if (this.instance.Name === name) return;

			const target = this.shaftManager.findNodeByName(name);
			if (!target) return;

			this.shaftManager.requestFloor(this, target);
		});
	}

	//

	onStart(): void {
		this.elevatorService.registerNode(this);

		this.bindFloorButton("G");
		this.bindFloorButton("1");

		this.getButton("call").MouseClick.Connect(() => {
			this.shaftManager.requestDoorOpen(this);
		});

		this.getButton("open").MouseClick.Connect(() => {
			this.shaftManager.requestDoorOpen(this);
		});

		this.getButton("close").MouseClick.Connect(() => {
			this.shaftManager.requestDoorClose(this);
		});
	}
}
