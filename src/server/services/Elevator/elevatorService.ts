import { Service } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import { ElevatorNode } from "server/components/Elevator/elevatorNode";
import { ShaftManager } from "./shaftManager";

/**
 * contains elevator as a type `Model[]`
 */
export type ShaftConfig = Model[];
export type ElevatorConfiguration = Record<string, ShaftConfig>;

@Service({})
export class ElevatorService {
	constructor() {
		const configModule = Workspace.WaitForChild("Elevators").WaitForChild("Configuration") as ModuleScript;
		this.configuration = require(configModule) as ElevatorConfiguration;

		this.initShaftManagers();
	}

	private initShaftManagers() {
		// eslint-disable-next-line roblox-ts/no-array-pairs
		for (const [name, _] of pairs(this.configuration)) {
			const manager = new ShaftManager();
			this.shaftManagers[name] = manager;
		}
	}

	private readonly configuration: ElevatorConfiguration;
	private readonly shaftManagers: Record<string, ShaftManager> = {};

	public registerNode(node: ElevatorNode) {
		const model = node.instance;

		// eslint-disable-next-line roblox-ts/no-array-pairs
		for (const [shaftName, models] of pairs(this.configuration)) {
			for (const m of models) {
				if (m === model) {
					const manager = this.shaftManagers[shaftName];
					manager.addNode(node);
					return;
				}
			}
		}
		$warn(`cannot determine what shaft '${model}' belongs to!`);
	}
}
