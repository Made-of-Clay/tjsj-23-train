export type TileType = "straight" | "turn" | "station";

export interface Puzzle {
    initTiles: number[][];
    description?: string;
    targetTime: number;
    tileInventory: { tileKind: number; count: number }[];
}

let cachedPuzzles: Puzzle[] = [];

export async function getRandPuzzle(): Promise<Puzzle | null> {
    if (!cachedPuzzles.length) {
        try {
            const response = await fetch("/puzzles.json").then((res) => res.json());
            cachedPuzzles = response;
        } catch (error) {
            console.error("Failed to load puzzles:", error);
        }
    }
    return cachedPuzzles[Math.floor(Math.random() * cachedPuzzles.length)] ?? null;
}
