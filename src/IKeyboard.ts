export const enum Key {
	Key0,
	Key1,
	Key2,
	Key3,
	Key4,
	Key5,
	Key6,
	Key7,
	Key8,
	Key9,
	KeyA,
	KeyB,
	KeyC,
	KeyD,
	KeyE,
	KeyF,
}

export interface IKeyboard {
	isPressed(button: Key): boolean;
	awaitKeyPress(): Promise<Key>;
}
