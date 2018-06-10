import { decode, getN, getNN, getNNN, getX, getY, Opcode } from "./Opcodes";

describe(`Opcodes`, () => {
	test(`getN() returns last 4 bits of opcode`, () => {
		expect(getN(0xbaef)).toBe(0xf);
	});
	test(`getNN() returns last 8 bits of opcode`, () => {
		expect(getNN(0xbaef)).toBe(0xef);
	});
	test(`getNNN() returns last 12 bits of opcode`, () => {
		expect(getNNN(0xbaef)).toBe(0xaef);
	});
	test(`getX() returns 5th to 8th bit of opcode`, () => {
		expect(getX(0xbaef)).toBe(0xa);
	});
	test(`getY() returns 9th to 12th bit of opcode`, () => {
		expect(getY(0xbaef)).toBe(0xe);
	});

	test(`decode() returns expected opcode`, () => {
		for (let i = 0; i <= 0xffff; i++) {
			const opcode = decode(i);

			if (i === 0xE0) {
				expect(opcode).toBe(Opcode.clearScreen);
			} else if (i === 0xEE) {
				expect(opcode).toBe(Opcode.returnSubroutine);
			} else if (i >= 0x1000 && i < 0x2000) {
				expect(opcode).toBe(Opcode.jumpToAddress);
			} else if (i >= 0x2000 && i < 0x3000) {
				expect(opcode).toBe(Opcode.callSubroutine);
			} else if (i >= 0x3000 && i < 0x4000) {
				expect(opcode).toBe(Opcode.skipIfRegisterIsEqualToValue);
			} else if (i >= 0x4000 && i < 0x5000) {
				expect(opcode).toBe(Opcode.skipIfRegisterIsNotEqualToValue);
			} else if (i >= 0x5000 && i < 0x6000 && (i & 0xf) === 0) {
				expect(opcode).toBe(Opcode.skipIfRegistersAreEqual);
			} else if (i >= 0x6000 && i < 0x7000) {
				expect(opcode).toBe(Opcode.setRegister);
			} else if (i >= 0x7000 && i < 0x8000) {
				expect(opcode).toBe(Opcode.addToRegister);
			} else if (i >= 0x8000 && i < 0x9000) {
				const n = i & 0xf;
				if (n === 0) {
					expect(opcode).toBe(Opcode.copyRegister);
				} else if (n === 1) {
					expect(opcode).toBe(Opcode.or);
				} else if (n === 2) {
					expect(opcode).toBe(Opcode.and);
				} else if (n === 3) {
					expect(opcode).toBe(Opcode.xor);
				} else if (n === 4) {
					expect(opcode).toBe(Opcode.addRegistersWithCarry);
				} else if (n === 5) {
					expect(opcode).toBe(Opcode.subtractRxMinusRyWithBorrow);
				} else if (n === 6) {
					expect(opcode).toBe(Opcode.shiftRight);
				} else if (n === 7) {
					expect(opcode).toBe(Opcode.subtractRyMinusRxWithBorrow);
				} else if (n === 0xe) {
					expect(opcode).toBe(Opcode.shiftLeft);
				} else {
					expect(opcode).toBe(Opcode.unknown);
				}
			} else if (i >= 0x9000 && i < 0xa000 && (i & 0xf) === 0) {
				expect(opcode).toBe(Opcode.skipIfRegistersNotEqual);
			} else if (i >= 0xa000 && i < 0xb000) {
				expect(opcode).toBe(Opcode.setPointer);
			} else if (i >= 0xb000 && i < 0xc000) {
				expect(opcode).toBe(Opcode.jumpToAddressPlusR0);
			} else if (i >= 0xc000 && i < 0xd000) {
				expect(opcode).toBe(Opcode.randomByte);
			} else if (i >= 0xd000 && i < 0xe000) {
				expect(opcode).toBe(Opcode.drawSprite);
			} else if (i >= 0xe000 && i < 0xf000) {
				const nn = i & 0xff;
				if (nn === 0x9e) {
					expect(opcode).toBe(Opcode.skipIfKeyPressed);
				} else if (nn === 0xa1) {
					expect(opcode).toBe(Opcode.skipIfKeyNotPressed);
				} else {
					expect(opcode).toBe(Opcode.unknown);
				}
			} else if (i >= 0xf000) {
				const nn = i & 0xff;
				if (nn === 0x7) {
					expect(opcode).toBe(Opcode.getDelayTimer);
				} else if (nn === 0xa) {
					expect(opcode).toBe(Opcode.awaitKeyPress);
				} else if (nn === 0x15) {
					expect(opcode).toBe(Opcode.setDelayTimer);
				} else if (nn === 0x18) {
					expect(opcode).toBe(Opcode.setSoundTimer);
				} else if (nn === 0x1e) {
					expect(opcode).toBe(Opcode.addToPointer);
				} else if (nn === 0x29) {
					expect(opcode).toBe(Opcode.getCharacterIndex);
				} else if (nn === 0x33) {
					expect(opcode).toBe(Opcode.toDecimal);
				} else if (nn === 0x55) {
					expect(opcode).toBe(Opcode.storeRegisters);
				} else if (nn === 0x65) {
					expect(opcode).toBe(Opcode.loadRegisters);
				} else {
					expect(opcode).toBe(Opcode.unknown);
				}
			} else {
				expect({ opcode, i }).toEqual({ opcode: Opcode.unknown, i });
			}
		}
	});
});
