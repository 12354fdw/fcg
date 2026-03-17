import { ElevatorNode } from "server/components/Elevator/elevatorNode";
import { TeleportVolume } from "server/components/Elevator/teleportVolume";
import { Queue } from "server/types/queue";

type teleportRequest = {
	from: ElevatorNode;
	to: ElevatorNode;
};

export class ShaftManager {
	private nodes: ElevatorNode[] = [];
	private floorQueue = new Queue<teleportRequest>();

	private idle: boolean = true;
	public isBusy: boolean = false;

	public addNode(node: ElevatorNode) {
		this.nodes.push(node);
		node.attachManager(this);
	}

	public requestFloor(from: ElevatorNode, to: ElevatorNode) {
		$debug(from, to);
		this.floorQueue.push({
			from: from,
			to: to,
		});

		if (this.idle) this.processQueue();
	}

	public findNodeByName(name: string): ElevatorNode | undefined {
		return this.nodes.find((node) => node.instance.Name === name);
	}

	private teleport() {
		this.idle = false;
		if (this.isBusy) return;

		const request = this.floorQueue.pop();
		if (request === undefined) {
			$trace("exitting");
			this.idle = true;
			return;
		}
		const target = request.to.instance.WaitForChild("TeleportationVolume") as Folder;

		request.from.Sounds.Moving.Play();
		task.wait(3.71);

		const snapshot = request.from.teleportVolume.capture();
		TeleportVolume.teleport(target, snapshot);
		task.wait(0.2);
		request.to.openNCloseDoors();
	}

	private processQueue() {
		for (;;) {
			$trace("attempting");
			this.teleport();
			if (this.idle) return;
			task.wait(0);
		}
	}
}
