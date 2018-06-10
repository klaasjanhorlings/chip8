// tslint:disable:align
export const getNNN = (b: number) => b & 0xfff;
export const getNN = (b: number) => b & 0xff;
export const getN = (b: number) => b & 0xf;
export const getX = (b: number) => (b >> 8) & 0xf;
export const getY = (b: number) => (b >> 4) & 0xf;

export const enum Opcode {
	/**
	 * Unknown
	 */
	unknown,

	/**
	 * 0x0NNN
	 * Calls RCA 1802 program at address NNN. Not necessary for most ROMs.
	 */
	x0NNN,

	/**
	 * 0x00E0
	 * Clears the screen.
	 */
	clearScreen,

	/**
	 * 0x00EE
	 * Returns from a subroutine.
	 */
	returnSubroutine,

	/**
	 * 0x1NNN
	 * Jumps to address NNN.
	 */
	jumpToAddress,

	/**
	 * 0x2NNN
	 * Calls subroutine at NNN.
	 */
	callSubroutine,

	/**
	 * 0x3XNN
	 * Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip
	 * a code block)
	 */
	skipIfRegisterIsEqualToValue,

	/**
	 * 0x4XNN
	 * Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump
	 * to skip a code block)
	 */
	skipIfRegisterIsNotEqualToValue,

	/**
	 * 0x5XY0
	 * Skips the next instruction if VX equals VY. (Usually the next instruction is a jump to skip
	 * a code block)
	 */
	skipIfRegistersAreEqual,

	/**
	 * 0x6XNN
	 * Sets VX to NN.
	 */
	setRegister,

	/**
	 * 0x7XNN
	 * Adds NN to VX. (Carry flag is not changed)
	 */
	addToRegister,

	/**
	 * 0x8XY0
	 * Sets VX to the value of VY.
	 */
	copyRegister,

	/**
	 * 0x8XY1
	 * Sets VX to VX or VY. (Bitwise OR operation)
	 */
	or,

	/**
	 * 0x8XY2
	 * Sets VX to VX and VY. (Bitwise AND operation)
	 */
	and,

	/**
	 * 0x8XY3
	 * Sets VX to VX xor VY.
	 */
	xor,

	/**
	 * 0x8XY4
	 * Adds VY to VX. VF is set to 1 when there's a carry, and to 0 when there isn't.
	 */
	addRegistersWithCarry,

	/**
	 * 0x8XY5
	 * VY is subtracted from VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 */
	subtractRxMinusRyWithBorrow,

	/**
	 * 0x8XY6
	 * Shifts VY right by one and copies the result to VX. VF is set to the value of the least
	 * significant bit of VY before the shift.
	 */
	shiftRight,

	/**
	 * 0x8XY7
	 * Sets VX to VY minus VX. VF is set to 0 when there's a borrow, and 1 when there isn't.
	 */
	subtractRyMinusRxWithBorrow,

	/**
	 * 0x8XYE
	 * Shifts VY left by one and copies the result to VX. VF is set to the value of the most
	 * significant bit of VY before the shift.
	 */
	shiftLeft,

	/**
	 * 0x9XY0
	 * Skips the next instruction if VX doesn't equal VY. (Usually the next instruction is a jump
	 * to skip a code block)
	 */
	skipIfRegistersNotEqual,

	/**
	 * 0xANNN
	 * Sets I to the address NNN.
	 */
	setPointer,

	/**
	 * 0xBNNN
	 * Jumps to the address NNN plus V0.
	 */
	jumpToAddressPlusR0,

	/**
	 * 0xCXNN
	 * Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255)
	 * and NN.
	 */
	randomByte,

	/**
	 * 0xDXYN
	 * Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
	 * Each row of 8 pixels is read as bit-coded starting from memory location I; I value doesn’t
	 * change after the execution of this instruction. As described above, VF is set to 1 if any
	 * screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that
	 * doesn’t happen
	 */
	drawSprite,

	/**
	 * 0xEX9E
	 * Skips the next instruction if the key stored in VX is pressed. (Usually the next instruction
	 * is a jump to skip a code block)
	 */
	skipIfKeyPressed,

	/**
	 * 0xEXA1
	 * Skips the next instruction if the key stored in VX isn't pressed. (Usually the next
	 * instruction is a jump to skip a code block)
	 */
	skipIfKeyNotPressed,

	/**
	 * 0xFX07
	 * Sets VX to the value of the delay timer.
	 */
	getDelayTimer,

	/**
	 * 0xFX0A
	 * A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted
	 * until next key event)
	 */
	awaitKeyPress,

	/**
	 * 0xFX15
	 * Sets the delay timer to VX.
	 */
	setDelayTimer,

	/**
	 * 0xFX18
	 * Sets the sound timer to VX.
	 */
	setSoundTimer,

	/**
	 * 0xFX1E
	 * Adds VX to I.[3]
	 */
	addToPointer,

	/**
	 * 0xFX29
	 * Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal)
	 * are represented by a 4x5 font.
	 */
	getCharacterIndex,

	/**
	 * 0xFX33
	 * Stores the binary-coded decimal representation of VX, with the most significant of three
	 * digits at the address in I, the middle digit at I plus 1, and the least significant digit at
	 * I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit
	 * in memory at location in I, the tens digit at location I+1, and the ones digit at location
	 * I+2.)
	 */
	toDecimal,

	/**
	 * 0xFX55
	 * Stores V0 to VX (including VX) in memory starting at address I. I is increased by 1 for each
	 * value written.
	 */
	storeRegisters,

	/**
	 * 0xFX65
	 * Fills V0 to VX (including VX) with values from memory starting at address I. I is increased
	 * by 1 for each value written.
	 */
	loadRegisters,
}

export const decode = (b: number) => {
	b = b & 0xffff;

	switch ((b >> 12) & 0xf) {
		case 0:
			switch (getNNN(b)) {
				case 0xE0:
					return Opcode.clearScreen;
				case 0xEE:
					return Opcode.returnSubroutine;
			}
			break;
		case 0x1:
			return Opcode.jumpToAddress;
		case 0x2:
			return Opcode.callSubroutine;
		case 0x3:
			return Opcode.skipIfRegisterIsEqualToValue;
		case 0x4:
			return Opcode.skipIfRegisterIsNotEqualToValue;
		case 0x5:
			if (getN(b) === 0) {
				return Opcode.skipIfRegistersAreEqual;
			}
			break;
		case 0x6:
			return Opcode.setRegister;
		case 0x7:
			return Opcode.addToRegister;
		case 0x8:
			switch (getN(b)) {
				case 0:
					return Opcode.copyRegister;
				case 0x1:
					return Opcode.or;
				case 0x2:
					return Opcode.and;
				case 0x3:
					return Opcode.xor;
				case 0x4:
					return Opcode.addRegistersWithCarry;
				case 0x5:
					return Opcode.subtractRxMinusRyWithBorrow;
				case 0x6:
					return Opcode.shiftRight;
				case 0x7:
					return Opcode.subtractRyMinusRxWithBorrow;
				case 0xE:
					return Opcode.shiftLeft;
			}
			break;
		case 0x9:
			if (getN(b) === 0) {
				return Opcode.skipIfRegistersNotEqual;
			}
			break;
		case 0xA:
			return Opcode.setPointer;
		case 0xB:
			return Opcode.jumpToAddressPlusR0;
		case 0xC:
			return Opcode.randomByte;
		case 0xD:
			return Opcode.drawSprite;
		case 0xE:
			switch (getNN(b)) {
				case 0x9E:
					return Opcode.skipIfKeyPressed;
				case 0xA1:
					return Opcode.skipIfKeyNotPressed;
			}
			break;
		case 0xF:
			switch (getNN(b)) {
				case 0x07:
					return Opcode.getDelayTimer;
				case 0x0A:
					return Opcode.awaitKeyPress;
				case 0x15:
					return Opcode.setDelayTimer;
				case 0x18:
					return Opcode.setSoundTimer;
				case 0x1E:
					return Opcode.addToPointer;
				case 0x29:
					return Opcode.getCharacterIndex;
				case 0x33:
					return Opcode.toDecimal;
				case 0x55:
					return Opcode.storeRegisters;
				case 0x65:
					return Opcode.loadRegisters;
			}
	}

	return Opcode.unknown;
};
