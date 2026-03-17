export class Queue<T extends defined> {
	private items: T[] = [];
	private head = 0;

	push(item: T) {
		this.items.push(item);
	}

	pop(): T | undefined {
		if (this.head >= this.items.size()) return undefined;
		return this.items[this.head++];
	}

	isEmpty() {
		return this.head >= this.items.size();
	}
}
