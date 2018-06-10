import { CPU } from "./CPU";
import { IGraphics } from "./IGraphics";
import { IKeyboard } from "./IKeyboard";
import { IMemory } from "./IMemory";
import { Memory } from "./Memory";
import { decode, Opcode } from "./opcodes";

describe(`CPU`, () => {
	let memory: IMemory;
	let graphics: IGraphics;
	let keyboard: IKeyboard;
	let cpu: CPU;

	const testProgramCounterAdvance = (instuction: number) => test(
		`instruction advances program counter`,
		() => {
			const current = cpu.programCounter;
			cpu.execute(instuction);
			expect(cpu.programCounter).toBe(current + 2);
		},
	);

	beforeEach(() => {
		memory = new Memory(1024);
		graphics = {
			draw: jest.fn(),
			clear: jest.fn(),
		};
		keyboard = {
			isPressed: jest.fn(),
			awaitKeyPress: jest.fn(),
		};
		cpu = new CPU(memory, graphics, keyboard);
	});

	test(`initializes with correct values`, () => {
		expect(cpu.callStack).toEqual([]);
		expect(cpu.memory).toBe(memory);
		expect(cpu.memoryPointer).toBe(0);
		expect(cpu.programCounter).toBe(0);
		expect(cpu.registers.length).toBe(16);
		for (let i = 0; i < 16; i++) {
			expect(cpu.registers[i]).toBe(0);
		}
	});

	describe(`0x00E0 clearScreen`, () => {
		testProgramCounterAdvance(0x00E0);
	});

	describe(`0x00EE returnSubroutine`, () => {
		test(`sets program counter to last stack address`, () => {
			cpu.callStack.push(0x1337);
			cpu.execute(0xee);
			expect(cpu.programCounter).toBe(0x1337);
		});

		test(`pops address from stack`, () => {
			cpu.callStack.push(0xd3ed);
			cpu.callStack.push(0x1337);
			cpu.execute(0xee);
			expect(cpu.callStack).toEqual([0xd3ed]);
		});
	});

	describe(`0x1NNN jumpToAddress`, () => {
		test(`sets program counter to passed address`, () => {
			cpu.execute(0x1321);
			expect(cpu.programCounter).toBe(0x321);
		});
	});

	describe(`0x2NNN callSubroutine`, () => {
		test(`sets program counter to passed address`, () => {
			cpu.execute(0x2123);
			expect(cpu.programCounter).toBe(0x123);
		});

		test(`pushes current address to stack`, () => {
			cpu.programCounter = 0x1023;
			cpu.execute(0x2123);
			expect(cpu.callStack).toEqual([0x1023]);
		});
	});

	describe(`0x3XNN skipIfRegisterIsEqualToValue`, () => {
		const instruction = 0x3aeb;

		test(`increases programCounter by 4 if register is not equal`, () => {
			cpu.registers[0xa] = 0xbe;
			cpu.execute(0x3abe);
			expect(cpu.programCounter).toBe(4);
		});

		test(`increases programCounter by 2 if register is equal`, () => {
			cpu.registers[0xa] = 0xbe;
			cpu.execute(0x3acf);
			expect(cpu.programCounter).toBe(2);
		});
	});

	describe(`0x4XNN skipIfRegisterIsNotEqualToValue`, () => {
		const instruction = 0x3aeb;

		test(`increases programCounter by 2 if register is equal`, () => {
			cpu.registers[0xa] = 0xbe;
			cpu.execute(0x4abe);
			expect(cpu.programCounter).toBe(2);
		});

		test(`increases programCounter by 4 if register is not equal`, () => {
			cpu.registers[0xa] = 0xbe;
			cpu.execute(0x4acf);
			expect(cpu.programCounter).toBe(4);
		});
	});

	describe(`0x5XY0 skipIfRegistersAreEqual`, () => {
		const instruction = 0x3aeb;

		beforeEach(() => {
			cpu.registers[0] = 25;
			cpu.registers[1] = 28;
			cpu.registers[2] = 25;
		});

		test(`increases programCounter by 4 if registers are equal`, () => {
			cpu.execute(0x5020);
			expect(cpu.programCounter).toBe(4);
		});

		test(`increases programCounter by 2 if registers are not equal`, () => {
			cpu.execute(0x5010);
			expect(cpu.programCounter).toBe(2);
		});
	});

	describe(`0x6XNN setRegister`, () => {
		testProgramCounterAdvance(0x6000);

		test(`sets register to passed value`, () => {
			cpu.execute(0x6543);
			expect(cpu.registers[5]).toBe(0x43);
		});
	});

	describe(`0x7XNN addToRegister`, () => {
		testProgramCounterAdvance(0x7000);

		test(`sets register to sum of register and value`, () => {
			cpu.registers[3] = 42;
			cpu.execute(0x7312);
			expect(cpu.registers[3]).toBe(60);
		});

		test(`does not carry over`, () => {
			cpu.registers[3] = 0xee;
			cpu.execute(0x7322);
			expect(cpu.registers[3]).toBe(0x10);
			expect(cpu.registers[0xf]).toBe(0);
		});
	});

	describe(`0x8XY0 copyRegister`, () => {
		testProgramCounterAdvance(0x8000);

		test(`copies register value to register`, () => {
			cpu.registers[3] = 0xab;
			cpu.execute(0x8350);
			expect(cpu.registers[5]).toBe(0xab);
		});
	});

	describe(`0x8XY1 or`, () => {
		testProgramCounterAdvance(0x8001);

		test(`sets register x to x OR y`, () => {
			cpu.registers[0] = 0x5c;
			cpu.registers[1] = 0xca;
			cpu.execute(0x8011);
			expect(cpu.registers[0]).toBe(0x5c | 0xca);
		});
	});

	describe(`0x8XY2 and`, () => {
		testProgramCounterAdvance(0x8002);

		test(`sets register x to x AND y`, () => {
			cpu.registers[0] = 0x5c;
			cpu.registers[1] = 0xca;
			cpu.execute(0x8012);
			expect(cpu.registers[0]).toBe(0x5c & 0xca);
		});
	});

	describe(`0x8XY3 xor`, () => {
		testProgramCounterAdvance(0x8003);

		test(`sets register x to x XOR y`, () => {
			cpu.registers[0] = 0x5c;
			cpu.registers[1] = 0xca;
			cpu.execute(0x8013);
			expect(cpu.registers[0]).toBe(0x5c ^ 0xca);
		});
	});

	describe(`0x8XY4 addRegistersWithCarry`, () => {
		testProgramCounterAdvance(0x8004);

		test(`sets carry to 0 on no overflow`, () => {
			cpu.registers[0] = 0x11;
			cpu.registers[3] = 0x22;
			cpu.execute(0x8034);
			expect(cpu.registers[0]).toBe(0x33);
			expect(cpu.registers[0xf]).toBe(0);
		});

		test(`sets carry to 1 on overflow`, () => {
			cpu.registers[0] = 0xee;
			cpu.registers[3] = 0x22;
			cpu.execute(0x8034);
			expect(cpu.registers[0]).toBe(0x10);
			expect(cpu.registers[0xf]).toBe(1);
		});
	});

	describe(`0x8XY5 subtractRxMinusRyWithBorrow`, () => {
		testProgramCounterAdvance(0x8005);

		test(`sets carry to 1 on no borrow`, () => {
			cpu.registers[0] = 0x55;
			cpu.registers[3] = 0x33;
			cpu.execute(0x8035);
			expect(cpu.registers[0]).toBe(0x22);
			expect(cpu.registers[0xf]).toBe(1);
		});

		test(`sets carry to 0 on borrow`, () => {
			cpu.registers[0] = 0x55;
			cpu.registers[3] = 0x66;
			cpu.execute(0x8035);
			expect(cpu.registers[0]).toBe(0xef);
			expect(cpu.registers[0xf]).toBe(0);
		});
	});

	describe(`0x8XY6 shiftRight`, () => {
		testProgramCounterAdvance(0x8006);

		test(`sets register x to register y >> 1`, () => {
			cpu.registers[1] = 0x55;
			cpu.execute(0x8016);
			expect(cpu.registers[0]).toBe(0x2a);
		});
	});

	describe(`0x8XY7 subtractRyMinusRxWithBorrow`, () => {
		testProgramCounterAdvance(0x8007);

		test(`sets carry to 1 on no borrow`, () => {
			cpu.registers[0] = 0x33;
			cpu.registers[3] = 0x55;
			cpu.execute(0x8037);
			expect(cpu.registers[0]).toBe(0x22);
			expect(cpu.registers[0xf]).toBe(1);
		});

		test(`sets carry to 0 on borrow`, () => {
			cpu.registers[0] = 0x66;
			cpu.registers[3] = 0x55;
			cpu.execute(0x8037);
			expect(cpu.registers[0]).toBe(0xef);
			expect(cpu.registers[0xf]).toBe(0);
		});
	});

	describe(`0x8XYE shiftLeft`, () => {
		testProgramCounterAdvance(0x800E);

		test(`sets register x to register y << 1`, () => {
			cpu.registers[1] = 0x55;
			cpu.execute(0x801E);
			expect(cpu.registers[0]).toBe(0xaa);
		});
	});

	describe(`0x9XY0 skipIfRegistersNotEqual`, () => {
		testProgramCounterAdvance(0x9000);
		const instruction = 0x3aeb;

		beforeEach(() => {
			cpu.registers[0] = 25;
			cpu.registers[1] = 28;
			cpu.registers[2] = 25;
		});

		test(`increases programCounter by 4 if registers are not equal`, () => {
			cpu.execute(0x9010);
			expect(cpu.programCounter).toBe(4);
		});

		test(`increases programCounter by 2 if registers are equal`, () => {
			cpu.execute(0x9020);
			expect(cpu.programCounter).toBe(2);
		});
	});

	describe(`0xANNN setPointer`, () => {
		testProgramCounterAdvance(0xa000);

		test(`sets memory pointer to passed address`, () => {
			cpu.execute(0xa123);
			expect(cpu.memoryPointer).toBe(0x123);
		});
	});

	describe(`0xBNNN jumpToAddressPlusR0`, () => {
		test(`sets programCounter to passed address plus register 0`, () => {
			cpu.registers[0] = 0x10;
			cpu.execute(0xbabc);
			expect(cpu.programCounter).toBe(0xacc);
		});
	});

	describe(`0xCXNN randomByte`, () => {
		testProgramCounterAdvance(0xc000);

		test(`sets register to random number AND passed value`, () => {
			const rng = () => 0x55;
			cpu = new CPU(memory, graphics, keyboard, rng);
			cpu.execute(0xc30f);
			expect(cpu.registers[3]).toBe(0x5);
		});
	});

	describe(`0xDXYN drawSprite`, () => {
		testProgramCounterAdvance(0xd000);

		beforeEach(() => {
			cpu.registers[0] = 4;
			cpu.registers[1] = 6;
		});

		test(`calls draw with the correct coordinates`, () => {
			cpu.execute(0xd013);
			const call = (graphics.draw as jest.Mock).mock.calls[0];
			expect(call[0]).toBe(4);
			expect(call[1]).toBe(6);
		});

		test(`calls draw with the correct sprite data`, () => {
			for (let i = 0; i < 4; i++) {
				memory.writeByte(i, i + 1);
			}
			cpu.memoryPointer = 1;

			cpu.execute(0xd012);
			const call = (graphics.draw as jest.Mock).mock.calls[0];
			expect(call[2]).toEqual(new Uint8Array([2, 3]));
		});

		test(`sets carry flag to 0 if graphics returns false`, () => {
			cpu.registers[0xf] = 1;
			(graphics.draw as jest.Mock).mockReturnValueOnce(false);
			cpu.execute(0xd012);
			expect(cpu.registers[0xf]).toBe(0);
		});

		test(`sets carry flag to 1 if graphics returns true`, () => {
			(graphics.draw as jest.Mock).mockReturnValueOnce(true);
			cpu.execute(0xd012);
			expect(cpu.registers[0xf]).toBe(1);
		});
	});

	describe(`0xEX9E skipIfKeyPressed`, () => {
		test(`calls isPressed on keyboard with passed key`, () => {
			cpu.registers[2] = 5;

			cpu.execute(0xe29e);
			const call = (keyboard.isPressed as jest.Mock).mock.calls[0];
			expect(call[0]).toBe(5);
		});

		test(`increases programCounter by 4 if key is pressed`, () => {
			(keyboard.isPressed as jest.Mock).mockReturnValueOnce(true);

			cpu.execute(0xe29e);
			expect(cpu.programCounter).toBe(4);
		});

		test(`increases programCounter by 2 if key is not pressed`, () => {
			(keyboard.isPressed as jest.Mock).mockReturnValueOnce(false);

			cpu.execute(0xe29e);
			expect(cpu.programCounter).toBe(2);
		});
	});

	describe(`0xEXA1 skipIfKeyNotPressed`, () => {
		test(`calls isPressed on keyboard with passed key`, () => {
			cpu.registers[2] = 5;

			cpu.execute(0xe2a1);
			const call = (keyboard.isPressed as jest.Mock).mock.calls[0];
			expect(call[0]).toBe(5);
		});

		test(`increases programCounter by 4 if key is not pressed`, () => {
			(keyboard.isPressed as jest.Mock).mockReturnValueOnce(false);

			cpu.execute(0xe2a1);
			expect(cpu.programCounter).toBe(4);
		});

		test(`increases programCounter by 2 if key is pressed`, () => {
			(keyboard.isPressed as jest.Mock).mockReturnValueOnce(true);

			cpu.execute(0xe2a1);
			expect(cpu.programCounter).toBe(2);
		});
	});

	describe(`0xFX07 getDelayTimer`, () => {
		testProgramCounterAdvance(0xF007);

		test(`copies delayTimer to register`, () => {
			cpu.delayTimer = 15;
			cpu.execute(0xf307);

			expect(cpu.registers[3]).toBe(15);
		});
	});

	describe(`0xFX0A awaitKeyPress`, () => {
		// testProgramCounterAdvance(0xF00A);
	});

	describe(`0xFX15 setDelayTimer`, () => {
		testProgramCounterAdvance(0xF015);

		test(`copies register to delayTimer`, () => {
			cpu.registers[3] = 10;
			cpu.execute(0xf315);

			expect(cpu.delayTimer).toBe(10);
		});
	});

	describe(`0xFX18 setSoundTimer`, () => {
		testProgramCounterAdvance(0xF018);

		test(`copies register to soundTimer`, () => {
			cpu.registers[4] = 10;
			cpu.execute(0xf418);

			expect(cpu.soundTimer).toBe(10);
		});
	});

	describe(`0xFX1E addToPointer`, () => {
		testProgramCounterAdvance(0xF01E);

		test(`sets I to register x + I`, () => {
			cpu.memoryPointer = 0x0a00;
			cpu.registers[5] = 6;
			cpu.execute(0xf51e);

			expect(cpu.memoryPointer).toBe(0x0a06);
		});
	});

	describe(`0xFX29 getCharacterIndex`, () => {
		testProgramCounterAdvance(0xF029);

		test(`sets I to expected address`, () => {
			cpu.registers[1] = 3;
			cpu.execute(0xf129);

			expect(cpu.memoryPointer).toBe(3 * 5);

			cpu.registers[1] = 5;
			cpu.execute(0xf129);

			expect(cpu.memoryPointer).toBe(5 * 5);
		});
	});

	describe(`0xFX33 toDecimal`, () => {
		testProgramCounterAdvance(0xF033);

		test(`sets memory addresses to expected digits`, () => {
			cpu.registers[1] = 123;
			cpu.memoryPointer = 8;
			cpu.execute(0xf133);

			expect(cpu.memory.readByte(8)).toBe(1);
			expect(cpu.memory.readByte(9)).toBe(2);
			expect(cpu.memory.readByte(10)).toBe(3);
		});
	});

	describe(`0xFX55 storeRegisters`, () => {
		testProgramCounterAdvance(0xF055);

		test(`writes contents of registers to expected address`, () => {
			for (let i = 0; i <= 0xf; i++) {
				cpu.registers[i] = i + 1;
			}
			cpu.memoryPointer = 0x10;
			cpu.execute(0xfa55);
			for (let i = 0; i <= 0xf; i++) {
				if (i <= 0xa) {
					expect(memory.readByte(i + 0x10)).toBe(i + 1);
				} else {
					expect(memory.readByte(i + 0x10)).toBe(0);
				}
			}
		});
	});

	describe(`0xFX65 loadRegisters`, () => {
		testProgramCounterAdvance(0xF065);

		test(`writes contents of memory to registers`, () => {
			for (let i = 0; i <= 0x20; i++) {
				memory.writeByte(i, i + 1);
			}
			const start = 15;
			const count = 10;
			cpu.memoryPointer = start;
			cpu.execute(0xfa65);
			for (let i = 0; i <= 0xf; i++) {
				if (i <= count) {
					expect(cpu.registers[i]).toBe(i + start + 1);
				} else {
					expect(cpu.registers[i]).toBe(0);
				}
			}
		});
	});

	test(`invalid opcodes do nothing`, () => {
		const nullRegisters = new Uint8Array(16);
		let invalid = 0;
		for (let i = 0; i <= 0xffff; i++) {
			if (decode(i) === Opcode.unknown) {
				expect(cpu.registers).toEqual(nullRegisters);
				expect(cpu.memoryPointer).toBe(0);
				expect(cpu.programCounter).toBe(0);
				expect(cpu.callStack.length).toBe(0);
				invalid++;
			}
		}
	});
});
