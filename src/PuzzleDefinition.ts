import puzzlesData from "../public/puzzles.json";

export type TileType = "straight" | "turn" | "station";

export interface Puzzle {
    initTiles: number[][];
    description?: string;
    targetTime: number;
    tileInventory: { tileKind: number; count: number }[];
}

export const PUZZLES: Puzzle[] = puzzlesData as Puzzle[];

export const DEFAULT_PUZZLE = PUZZLES[0];

export function getRandPuzzle(): Puzzle {
    return PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
}
