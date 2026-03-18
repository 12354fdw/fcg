export function wait(seconds: number) {
	return new Promise<void>((resolve) => {
		task.delay(seconds, resolve);
	});
}
