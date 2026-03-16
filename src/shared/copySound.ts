export function copySound(source: Instance, dest: Instance): Sound {
	const sound = source.Clone() as Sound;
	sound.Parent = dest;
	return sound;
}
