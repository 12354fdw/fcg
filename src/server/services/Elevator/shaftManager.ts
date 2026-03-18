import { ElevatorNode } from "server/components/Elevator/elevatorNode";
import { TeleportVolume } from "server/components/Elevator/teleportVolume";
import { Queue } from "server/types/queue";
import { wait } from "shared/utils";

type teleportRequest = {
	from: ElevatorNode;
	to: ElevatorNode;
};

export type ElevatorState = "idle" | "moving" | "doorsOpening" | "doorsOpen" | "doorsClosing";

// welcome to state machine and promise hell
// it works ok? it just works. you can refactor this
// TODO: fix this spaghetti
export class ShaftManager {
	private nodes: ElevatorNode[] = [];
	private floorQueue = new Queue<teleportRequest>();

	private processing = false;
	private state: ElevatorState = "idle";

	private doorResolve?: () => void;
	private doorPromise?: Promise<void>;
	private doorSession: number = 0;

	private lastDeliveredFloor?: ElevatorNode;

	public addNode(node: ElevatorNode) {
		this.nodes.push(node);
		node.attachManager(this);
	}

	public requestFloor(from: ElevatorNode, to: ElevatorNode) {
		this.floorQueue.push({ from, to });
		this.processQueue();
	}

	public findNodeByName(name: string): ElevatorNode | undefined {
		return this.nodes.find((node) => node.instance.Name === name);
	}

	//

	private async processQueue() {
		if (this.processing) return;
		this.processing = true;

		while (!this.floorQueue.isEmpty()) {
			await wait(0.01); // prevent a fatal bug

			if (this.state !== "idle") break;

			const request = this.floorQueue.pop();
			if (!request) break;

			if (request.to === this.lastDeliveredFloor) continue;
			this.lastDeliveredFloor = request.to;

			await this.handleTeleport(request);
		}
		this.processing = false;
	}

	//

	private async handleTeleport(request: teleportRequest) {
		this.setState("moving");

		request.from.Sounds.Moving.Play();
		await wait(3.71);

		const target = request.to.instance.WaitForChild("TeleportationVolume") as Folder;
		const snapshot = request.from.teleportVolume.capture();
		TeleportVolume.teleport(target, snapshot);

		await wait(0.2);

		this.startDoors(request.to);
		await this.waitForDoors();
	}

	//

	private async startDoors(node: ElevatorNode) {
		if (this.state !== "moving" && this.state !== "idle") return;

		this.setState("doorsOpening");

		this.doorSession++;
		const session = this.doorSession;

		node.Sounds.Ding.Play();
		node.Sounds.Doors.Play();
		await node.elevatorDoor.open();

		if (session !== this.doorSession) return;

		this.setState("doorsOpen");

		this.doorPromise = new Promise<void>((resolve) => {
			this.doorResolve = resolve;
		});

		task.delay(10, () => {
			if (session !== this.doorSession) return;

			if (this.state === "doorsOpen") {
				this.requestDoorClose(node);
			}
		});
	}

	private async waitForDoors() {
		if (this.doorPromise) {
			await this.doorPromise;
		}
	}

	//

	public async requestDoorOpen(node: ElevatorNode) {
		if (this.state !== "idle") return;

		this.startDoors(node);
		await this.waitForDoors();
	}

	public async requestDoorClose(node: ElevatorNode) {
		if (this.state !== "doorsOpen") return;

		this.doorSession++;
		const session = this.doorSession;

		this.setState("doorsClosing");

		node.Sounds.Doors.Play();
		await node.elevatorDoor.close();

		if (session !== this.doorSession) return;

		this.setState("idle");

		if (this.doorResolve) {
			this.doorResolve();
			this.doorResolve = undefined;
			this.doorPromise = undefined;
		}

		this.processQueue();
	}

	//

	private setState(newState: ElevatorState) {
		this.state = newState;
	}

	public getState() {
		return this.state;
	}
}
