import { IMemory } from "./IMemory";
import { Memory } from "./Memory";

describe(`Memory`, () => {
	let memory: IMemory;
	beforeEach(() => {
		memory = new Memory(1024);
	});

	test(`initializes with all 0s`, () => {
		for (let i = 0; i < memory.size; i++) {
			expect(memory.readByte(i)).toBe(0);
		}
	});

	test(`readByte() throws error when address is out of bounds`, () => {
		expect(() => memory.readByte(-1)).toThrow();
		expect(() => memory.readByte(memory.size)).toThrow();
	});

	test(`writeByte() throws error when address is out of bounds`, () => {
		expect(() => memory.writeByte(-1, 0)).toThrow();
		expect(() => memory.writeByte(memory.size, 0)).toThrow();
	});

	test(`readByte() returns value set by writeByte()`, () => {
		for (let i = 0; i < memory.size; i++) {
			const value = Math.round(Math.random() * 0xff);
			memory.writeByte(i, value);

			expect(memory.readByte(i)).toBe(value);
		}
	});

	test(`readShort() throws error when address is out of bounds`, () => {
		expect(() => memory.readShort(-1)).toThrow();
		expect(() => memory.readShort(memory.size)).toThrow();
	});

	test(`writeShort() throws error when address is out of bounds`, () => {
		expect(() => memory.writeShort(-1, 0)).toThrow();
		expect(() => memory.writeShort(memory.size, 0)).toThrow();
	});

	test(`readShort() returns value set by writeShort()`, () => {
		for (let i = 0; i < memory.size; i += 2) {
			const value = Math.round(Math.random() * 0xffff);
			memory.writeShort(i, value);

			expect(memory.readShort(i)).toBe(value);
		}
	});
});
