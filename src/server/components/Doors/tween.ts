import { TweenService } from "@rbxts/services";

export function tween(part: BasePart, target: BasePart, time: number, block: boolean = false) {
	const promise = new Promise<Tween>((resolve) => {
		const tweenInfo = new TweenInfo(time);

		const tw = TweenService.Create(part, tweenInfo, {
			CFrame: target.CFrame,
		});

		tw.Completed.Connect(() => {
			resolve(tw);
		});

		tw.Play();
	});

	if (block) {
		return promise.await()[0];
	}

	return promise;
}
