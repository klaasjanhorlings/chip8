// tslint:disable:align
import { IGraphics } from "./IGraphics";
import { IKeyboard } from "./IKeyboard";
import { IMemory } from "./IMemory";
import { decode, getN, getNN, getNNN, getX, getY, Opcode } from "./opcodes";

export class CPU {
	public readonly registers: Uint8Array = new Uint8Array(16);
	public readonly callStack: number[] = [];

	public programCounter: number = 0;
	public memoryPointer: number = 0;

	public delayTimer: number = 0;
	public soundTimer: number = 0;

	/**
	 * Create a new CPU instance
	 * @param memory
	 * @param rng Function that returns a random number between 0 and 255 (inclusive)
	 */
	constructor(
		public readonly memory: IMemory,
		public readonly graphics: IGraphics,
		public readonly keyboard: IKeyboard,
		public readonly rng: () => number = () => (Math.random() * 0xff) & 0xff,
	) {
	}

	public execute(op: number) {
		const opcode = decode(op);
		const n = getN(op);
		const nn = getNN(op);
		const nnn = getNNN(op);
		const x = getX(op);
		const y = getY(op);

		switch (opcode) {
			case Opcode.clearScreen:
				this.clearScreen();
			break;

			case Opcode.returnSubroutine:
				this.returnSubroutine();
			break;

			case Opcode.jumpToAddress:
				this.jumpToAddress(nnn);
			break;

			case Opcode.callSubroutine:
				this.callSubroutine(nnn);
			break;

			case Opcode.skipIfRegisterIsEqualToValue:
				this.skipIfRegisterIsEqualToValue(x, nn);
			break;

			case Opcode.skipIfRegisterIsNotEqualToValue:
				this.skipIfRegisterIsNotEqualToValue(x, nn);
			break;

			case Opcode.skipIfRegistersAreEqual:
				this.skipIfRegistersAreEqual(x, y);
			break;

			case Opcode.setRegister:
				this.setRegister(x, nn);
			break;

			case Opcode.addToRegister:
				this.addToRegister(x, nn);
			break;

			case Opcode.copyRegister:
				this.copyRegister(x, y);
			break;

			case Opcode.or:
				this.or(x, y);
			break;

			case Opcode.and:
				this.and(x, y);
			break;

			case Opcode.xor:
				this.xor(x, y);
			break;

			case Opcode.addRegistersWithCarry:
				this.addRegistersWithCarry(x, y);
			break;

			case Opcode.subtractRxMinusRyWithBorrow:
				this.subtractRxMinusRyWithBorrow(x, y);
			break;

			case Opcode.shiftRight:
				this.shiftRight(x, y);
			break;

			case Opcode.subtractRyMinusRxWithBorrow:
				this.subtractRyMinusRxWithBorrow(x, y);
			break;

			case Opcode.shiftLeft:
				this.shiftLeft(x, y);
			break;

			case Opcode.skipIfRegistersNotEqual:
				this.skipIfRegistersNotEqual(x, y);
			break;

			case Opcode.setPointer:
				this.setPointer(nnn);
			break;

			case Opcode.jumpToAddressPlusR0:
				this.jumpToAddressPlusR0(nnn);
			break;

			case Opcode.randomByte:
				this.randomByte(x, nn);
			break;

			case Opcode.drawSprite:
				this.drawSprite(x, y, n);
			break;

			case Opcode.skipIfKeyPressed:
				this.skipIfKeyPressed(x);
			break;

			case Opcode.skipIfKeyNotPressed:
				this.skipIfKeyNotPressed(x);
			break;

			case Opcode.getDelayTimer:
				this.getDelayTimer(x);
			break;

			case Opcode.awaitKeyPress:
				this.awaitKeyPress(x);
			break;

			case Opcode.setDelayTimer:
				this.setDelayTimer(x);
			break;

			case Opcode.setSoundTimer:
				this.setSoundTimer(x);
			break;

			case Opcode.addToPointer:
				this.addToPointer(x);
			break;

			case Opcode.getCharacterIndex:
				this.getCharacterIndex(x);
			break;

			case Opcode.toDecimal:
				this.toDecimal(x);
			break;

			case Opcode.storeRegisters:
				this.storeRegisters(x);
			break;

			case Opcode.loadRegisters:
				this.loadRegisters(x);
			break;

			case Opcode.unknown:
			default:

			break;
		}
	}

	/**
	 * Clears the screen.
	 */
	private clearScreen() {
		this.programCounter += 2;
	}

	/**
	 * Returns from a subroutine.
	 */
	private returnSubroutine() {
		this.programCounter = this.callStack.pop() || this.programCounter;
	}

	/**
	 * Jumps to address NNN.
	 * @param address Memory address to jump to
	 */
	private jumpToAddress(address: number) {
		this.programCounter = address;
	}

	/**
	 * Calls subroutine at NNN.
	 * @param address Memory address of the subroutine
	 */
	private callSubroutine(address: number) {
		this.callStack.push(this.programCounter);
		this.programCounter = address;
	}

	/**
	 * Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip
	 * a code block)
	 * @param register Register index (0-15)
	 * @param value Value to compare against
	 */
	private skipIfRegisterIsEqualToValue(register: number, value: number) {
		if (this.registers[register] === value) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump
	 * to skip a code block)
	 * @param register Register index (0-15)
	 * @param value Value to compare against
	 */
	private skipIfRegisterIsNotEqualToValue(register: number, value: number) {
		if (this.registers[register] !== value) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip
	 * a code block)
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private skipIfRegistersAreEqual(registerA: number, registerB: number) {
		if (this.registers[registerA] === this.registers[registerB]) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Sets VX to NN.
	 * @param register Register to store the value (0-15)
	 * @param value Value to set to register
	 */
	private setRegister(register: number, value: number) {
		this.registers[register] = value;
		this.programCounter += 2;
	}

	/**
	 * Adds NN to VX. (Carry flag is not changed)
	 * @param register Register to store the result (0-15)
	 * @param value Value to add to register
	 */
	private addToRegister(register: number, value: number) {
		this.registers[register] += value;
		this.programCounter += 2;
	}

	/**
	 * Sets VX to the value of VY.
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private copyRegister(registerA: number, registerB: number) {
		this.registers[registerB] = this.registers[registerA];
		this.programCounter += 2;
	}

	/**
	 * Sets VX to VX or VY. (Bitwise OR operation)
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private or(registerA: number, registerB: number) {
		this.registers[registerA] |= this.registers[registerB];
		this.programCounter += 2;
	}

	/**
	 * Sets VX to VX and VY. (Bitwise AND operation)
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private and(registerA: number, registerB: number) {
		this.registers[registerA] &= this.registers[registerB];
		this.programCounter += 2;
	}

	/**
	 * Sets VX to VX xor VY. (Bitwase XOR operation)
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private xor(registerA: number, registerB: number) {
		this.registers[registerA] ^= this.registers[registerB];
		this.programCounter += 2;
	}

	/**
	 * Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private addRegistersWithCarry(registerA: number, registerB: number) {
		const result = this.registers[registerA] + this.registers[registerB];
		this.registers[registerA] = result;
		this.registers[0xf] = result > 0xff ? 1 : 0;
		this.programCounter += 2;
	}

	/**
	 * VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private subtractRxMinusRyWithBorrow(registerA: number, registerB: number) {
		const result = this.registers[registerA] - this.registers[registerB];
		this.registers[registerA] = result & 0xff;
		this.registers[0xf] = result < 0 ? 0 : 1;
		this.programCounter += 2;
	}

	/**
	 * Shifts VY right by one and copies the result to VX. VF is set to the value of the least
	 * significant bit of VY before the shift.[2]
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private shiftRight(registerA: number, registerB: number) {
		this.registers[0xf] = this.registers[registerB] & 1;
		this.registers[registerA] = this.registers[registerB] >> 1;
		this.programCounter += 2;
	}

	/**
	 * Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private subtractRyMinusRxWithBorrow(registerA: number, registerB: number) {
		const result = this.registers[registerB] - this.registers[registerA];
		this.registers[registerA] = result & 0xff;
		this.registers[0xf] = result < 0 ? 0 : 1;
		this.programCounter += 2;
	}

	/**
	 * Shifts VY left by one and copies the result to VX. VF is set to the value of the most
	 * significant bit of VY before the shift.[2]
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private shiftLeft(registerA: number, registerB: number) {
		this.registers[0xf] = (this.registers[registerB] >> 7) & 1;
		this.registers[registerA] = this.registers[registerB] << 1;
		this.programCounter += 2;
	}

	/**
	 * Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump
	 * to skip a code block)
	 * @param registerA Register index (0-15)
	 * @param registerB Register index (0-15)
	 */
	private skipIfRegistersNotEqual(registerA: number, registerB: number) {
		if (this.registers[registerA] !== this.registers[registerB]) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Sets I to the address NNN.
	 * @param address Memory address to set I to
	 */
	private setPointer(address: number) {
		this.memoryPointer = address;
		this.programCounter += 2;
	}

	/**
	 * Jumps to the address NNN plus V0.
	 * @param address Memory address to jump to
	 */
	private jumpToAddressPlusR0(address: number) {
		this.programCounter = address + this.registers[0];
	}

	/**
	 * Sets VX to the result of a bitwise AND operation on a random number (Typically: 0 to 255)
	 * and NN.
	 * @param x Register to store the result (0-15)
	 * @param value Value to perform AND operation with
	 */
	private randomByte(register: number, value: number) {
		this.registers[register] = this.rng() & value;
		this.programCounter += 2;
	}

	/**
	 * Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
	 * Each row of 8 pixels is read as bit-coded starting from memory location I; I value doesn’t
	 * change after the execution of this instruction. As described above, VF is set to 1 if any
	 * screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that
	 * doesn’t happen.
	 * @param x Register containing the x coordinate (0-15)
	 * @param y Register containing the y coordinate (0-15)
	 * @param top Number of rows to draw
	 */
	private drawSprite(x: number, y: number, rows: number) {
		const lines = new Uint8Array(rows);
		for (let i = 0; i < rows; i++) {
			lines[i] = this.memory.readByte(this.memoryPointer + i);
		}
		const flipped = this.graphics.draw(this.registers[x], this.registers[y], lines);
		this.registers[0xf] = flipped ? 1 : 0;
		this.programCounter += 2;
	}

	/**
	 * Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction
	 * is a jump to skip a code block)
	 * @param register Register containing the key identifier (0-15)
	 */
	private skipIfKeyPressed(register: number) {
		if (this.keyboard.isPressed(this.registers[register] & 0xf)) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Skips the next instruction if the key stored in VX isn't pressed. (Usually the next
	 * instruction is a jump to skip a code block)
	 * @param register Register containing the key identifier (0-15)
	 */
	private skipIfKeyNotPressed(register: number) {
		if (!this.keyboard.isPressed(this.registers[register] & 0xf)) {
			this.programCounter += 2;
		}
		this.programCounter += 2;
	}

	/**
	 * Sets VX to the value of the delay timer.
	 * @param register Register index to store the delay timer value (0-15)
	 */
	private getDelayTimer(register: number) {
		this.registers[register & 0xf] = this.delayTimer;
		this.programCounter += 2;
	}

	/**
	 * A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted
	 * until next key event)
	 * @param register Register index to store the key identifier (0-15)
	 */
	private awaitKeyPress(register: number) {
		this.programCounter += 2;
	}

	/**
	 * Sets the delay timer to VX.
	 * @param register Register containing the new delay timer value (0-15)
	 */
	private setDelayTimer(register: number) {
		this.delayTimer = this.registers[register & 0xf];
		this.programCounter += 2;
	}

	/**
	 * Sets the sound timer to VX.
	 * @param register Register containing the new sound timer value (0-15)
	 */
	private setSoundTimer(register: number) {
		this.soundTimer = this.registers[register & 0xf];
		this.programCounter += 2;
	}

	/**
	 * Adds VX to I.[3]
	 * @param register Register containing the value to add to I (0-15)
	 */
	private addToPointer(register: number) {
		this.memoryPointer += this.registers[register & 0xf];
		this.programCounter += 2;
	}

	/**
	 * Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal)
	 * are represented by a 4x5 font.
	 * @param register Register containing the character index (0-15)
	 */
	private getCharacterIndex(register: number) {
		this.memoryPointer = (this.registers[register & 0xf] & 0xf) * 5;
		this.programCounter += 2;
	}

	/**
	 * Stores the binary-coded decimal representation of VX, with the most significant of three
	 * digits at the address in I, the middle digit at I plus 1, and the least significant digit
	 * at I plus 2. (In other words, take the decimal representation of VX, place the hundreds
	 * digit in memory at location in I, the tens digit at location I+1, and the ones digit at
	 * location I+2.)
	 * @param register Register containing the number to be presented as decimal (0-15)
	 */
	private toDecimal(register: number) {
		const val = this.registers[register];
		this.memory.writeByte(this.memoryPointer, Math.floor(val / 100));
		this.memory.writeByte(this.memoryPointer + 1, Math.floor(val / 10) % 10);
		this.memory.writeByte(this.memoryPointer + 2, val % 10);
		this.programCounter += 2;
	}

	/**
	 * Stores V0 to VX (including VX) in memory starting at address I. I is increased by 1 for each
	 * value written.
	 * @param register Last register index to read from (0-15)
	 */
	private storeRegisters(register: number) {
		for (let i = 0; i <= register; i++) {
			this.memory.writeByte(this.memoryPointer++, this.registers[i]);
		}
		this.programCounter += 2;
	}

	/**
	 * Fills V0 to VX (including VX) with values from memory starting at address I. I is increased
	 * by 1 for each value written.
	 * @param register Last register index to store to (0-15)
	 */
	private loadRegisters(register: number) {
		for (let i = 0; i <= register; i++) {
			this.registers[i] = this.memory.readByte(this.memoryPointer++);
		}
		this.programCounter += 2;
	}
}
