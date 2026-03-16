import { Workspace } from "@rbxts/services";

export type TeleportSnapshot = Map<Model, CFrame>;

export class TeleportVolume {
	private readonly A: BasePart;
	private readonly B: BasePart;
	private readonly overlapParams: OverlapParams;

	constructor(bounds: Folder, blacklist?: Instance) {
		const a = bounds.FindFirstChild("A");
		const b = bounds.FindFirstChild("B");

		if (!a || !a.IsA("BasePart")) {
			$error("A isn't valid!");
			throw "A isn't valid!";
		}

		if (!b || !b.IsA("BasePart")) {
			$error("B isn't valid!");
			throw "B isn't valid!";
		}

		this.A = a;
		this.B = b;

		this.overlapParams = new OverlapParams();
		this.overlapParams.FilterType = Enum.RaycastFilterType.Exclude;

		if (blacklist) {
			this.overlapParams.FilterDescendantsInstances = [blacklist];
		}
	}

	private computeBounds() {
		const a = this.A.Position;
		const b = this.B.Position;

		const min = new Vector3(math.min(a.X, b.X), math.min(a.Y, b.Y), math.min(a.Z, b.Z));
		const max = new Vector3(math.max(a.X, b.X), math.max(a.Y, b.Y), math.max(a.Z, b.Z));

		const center = min.add(max).div(2);
		const size = max.sub(min);

		return {
			cframe: new CFrame(center),
			size: size,
		};
	}

	public getParts() {
		const bounds = this.computeBounds();
		return Workspace.GetPartBoundsInBox(bounds.cframe, bounds.size, this.overlapParams);
	}

	public getModels(): Model[] {
		const parts = this.getParts();
		const models = new Set<Model>();

		for (const part of parts) {
			const model = part.FindFirstAncestorOfClass("Model");
			if (!model) continue;

			const root = model.PrimaryPart ?? model.FindFirstChild("HumanoidRootPart");

			if (!root || !root.IsA("BasePart")) continue;
			if (root.Anchored) continue;

			models.add(model);
		}

		return [...models];
	}

	public capture(): TeleportSnapshot {
		const snapshot: TeleportSnapshot = new Map();
		const aCF = this.A.CFrame;

		for (const model of this.getModels()) {
			const root = model.PrimaryPart ?? (model.FindFirstChild("HumanoidRootPart") as BasePart);
			if (!root) continue;

			const relative = aCF.ToObjectSpace(root.CFrame);
			snapshot.set(model, relative);
		}

		return snapshot;
	}

	public static teleport(bounds: Folder, snapshot: TeleportSnapshot) {
		const a = bounds.FindFirstChild("A");
		const b = bounds.FindFirstChild("B");

		if (!a || !a.IsA("BasePart")) {
			$error("A isn't valid!");
			throw "A isn't valid!";
		}

		if (!b || !b.IsA("BasePart")) {
			$error("B isn't valid!");
			throw "B isn't valid!";
		}

		const aCF = a.CFrame;

		for (const [model, relative] of snapshot) {
			const root = model.PrimaryPart ?? model.FindFirstChild("HumanoidRootPart");

			if (!root || !root.IsA("BasePart")) continue;

			const world = aCF.ToWorldSpace(relative);
			model.PivotTo(world);
		}
	}
}
