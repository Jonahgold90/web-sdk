import { SYMBOL_SIZE, REEL_PADDING, BOARD_DIMENSIONS } from './constants';

/**
 * Calculate the center position of a grid cell for the 5x3 board
 * @param col Column index (0-4)
 * @param row Row index (0-2) 
 * @returns {x, y} position in pixels relative to board origin
 */
export function getCellCenter(col: number, row: number): { x: number; y: number } {
	// Validate input
	if (col < 0 || col >= BOARD_DIMENSIONS.x) {
		throw new Error(`Invalid column ${col}. Must be 0-${BOARD_DIMENSIONS.x - 1}`);
	}
	if (row < 0 || row >= BOARD_DIMENSIONS.y) {
		throw new Error(`Invalid row ${row}. Must be 0-${BOARD_DIMENSIONS.y - 1}`);
	}

	// Calculate x position (same as existing symbol positioning)
	const x = SYMBOL_SIZE * (col + REEL_PADDING);

	// Calculate y position (center of cell)
	const y = (row + 0.5) * SYMBOL_SIZE;

	return { x, y };
}

/**
 * Get all cell centers for the 5x3 grid
 * @returns Array of {col, row, x, y} for all cells
 */
export function getAllCellCenters(): Array<{ col: number; row: number; x: number; y: number }> {
	const centers = [];
	for (let col = 0; col < BOARD_DIMENSIONS.x; col++) {
		for (let row = 0; row < BOARD_DIMENSIONS.y; row++) {
			const { x, y } = getCellCenter(col, row);
			centers.push({ col, row, x, y });
		}
	}
	return centers;
}

/**
 * Convert grid position to board array indices
 * Note: Grid uses (col, row) format while board array uses [reel][symbol]
 * @param col Column index (0-4)
 * @param row Row index (0-2)
 * @returns {reel, symbolIndex} for board access
 */
export function gridToBoard(col: number, row: number): { reel: number; symbolIndex: number } {
	return {
		reel: col,
		symbolIndex: row + 1 // +1 because board includes padding symbols
	};
}

/**
 * Convert board array indices to grid position
 * @param reel Reel index (0-4)
 * @param symbolIndex Symbol index including padding (1-3 for visible symbols)
 * @returns {col, row} grid position
 */
export function boardToGrid(reel: number, symbolIndex: number): { col: number; row: number } {
	return {
		col: reel,
		row: symbolIndex - 1 // -1 because board includes padding symbols
	};
}