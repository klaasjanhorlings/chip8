import { IMemory } from "./IMemory";

export class Memory implements IMemory {
	private data: Uint8ClampedArray;

	constructor(public readonly size: number) {
		this.data = new Uint8ClampedArray(size);
	}

	public readByte(address: number): number {
		this.throwOnOutOfBounds(address);
		return this.data[address];
	}
	public writeByte(address: number, value: number): void {
		this.throwOnOutOfBounds(address);
		this.data[address] = value;
	}
	public readShort(address: number): number {
		this.throwOnOutOfBounds(address);
		return this.readByte(address) << 8 | this.readByte(address + 1);
	}
	public writeShort(address: number, value: number): void {
		this.throwOnOutOfBounds(address);
		this.writeByte(address, (value >> 8) & 0xff);
		this.writeByte(address + 1, value & 0xff);
	}

	private throwOnOutOfBounds(address: number): void {
		if (address < 0 || address >= this.size) {
			throw new Error(`Address is out of bounds`);
		}
	}
}
