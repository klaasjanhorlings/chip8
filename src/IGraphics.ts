export interface IGraphics {
	draw(x: number, y: number, lines: Uint8Array): boolean;
	clear(): void;
}
