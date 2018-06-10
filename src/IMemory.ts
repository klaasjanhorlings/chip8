export interface IMemory {
	readonly size: number;

	readByte(address: number): number;
	writeByte(address: number, value: number): void;
	readShort(address: number): number;
	writeShort(address: number, value: number): void;
}
