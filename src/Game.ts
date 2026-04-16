import type { GridCell } from "./GridCell.ts";
import { DEFAULT_PUZZLE, type Puzzle } from "./PuzzleDefinition.ts";
import {
    DEFAULT_TILE_CELL,
    getTileDefinition,
    normalizeOrientation,
    type TileCell,
    TileKind,
    TileOrientation,
} from "./TileDefinitions.ts";
import type { SelectedTile, TileTray } from "./TileTray/TileTray.ts";

export class Game {
    grid: TileCell[][];
    puzzle: Puzzle;
    targetTime: number = 0;
    currentTime: number = 0;
    gameWon = false;
    statusMessage = "";
    hasUpgrades = false;
    selectedGridCell: GridCell | null = null;
    tray: TileTray;
    #gridDirty = true;

    get selectedTile(): SelectedTile {
        return this.tray.selected;
    }

    constructor(tray: TileTray, puzzle: Puzzle = DEFAULT_PUZZLE) {
        this.puzzle = puzzle;
        // Convert initTiles (number[][]) to TileCell[][], assuming default North orientation
        this.grid = puzzle.initTiles.map((row) =>
            row.map((kind) => ({
                kind: kind as TileKind,
                orientation: TileOrientation.North,
            })),
        );
        this.tray = tray;
        this.tray.setInventory(puzzle.tileInventory);
        this.targetTime = puzzle.targetTime;
        this.statusMessage =
            this.targetTime > 0 ? `Match the target time of ${this.targetTime}.` : "Place tiles to set the total time.";
        this.#recalculateTimeAndCheckWin();
        this.tray.setOnSelectKind(() => {
            this.selectedGridCell = null;
            this.#gridDirty = true;
            this.#updateTraySelectedPlaced();
        });
        this.#updateTraySelectedPlaced();
    }

    setTile(columnIdx: number, rowIdx: number, kind: TileKind, orientation: TileOrientation) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        this.grid[rowIdx][columnIdx] = {
            kind,
            orientation: normalizeOrientation(orientation),
        };
        this.hasUpgrades = true;
        this.#gridDirty = true;
        this.#recalculateTimeAndCheckWin();
    }

    placeSelectedTileAt(columnIdx: number, rowIdx: number) {
        if (this.gameWon) return false;
        if (!this.tray.canPlaceSelected()) return false;
        if (!this.#isValidPosition(columnIdx, rowIdx)) return false;

        this.setTile(columnIdx, rowIdx, this.selectedTile.kind, this.selectedTile.orientation);
        const placed = this.tray.useSelectedTile();
        if (!placed) {
            this.clearTile(columnIdx, rowIdx);
        }
        return placed;
    }

    toggleTileSelection(columnIdx: number, rowIdx: number) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        const currentlySelected = this.selectedGridCell;
        if (currentlySelected?.column === columnIdx && currentlySelected.row === rowIdx) {
            this.selectedGridCell = null;
        } else {
            this.selectedGridCell = { column: columnIdx, row: rowIdx };
        }

        this.#gridDirty = true;
        this.#updateTraySelectedPlaced();
    }

    clearSelectedGridCell() {
        if (this.selectedGridCell === null) return;

        this.selectedGridCell = null;
        this.#gridDirty = true;
        this.#updateTraySelectedPlaced();
    }

    clearTile(columnIdx: number, rowIdx: number) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        if (this.selectedGridCell?.column === columnIdx && this.selectedGridCell.row === rowIdx) {
            this.selectedGridCell = null;
        } else {
            console.warn("WTF? Analyze what happened here");
        }

        this.grid[rowIdx][columnIdx] = { ...DEFAULT_TILE_CELL };
        this.#gridDirty = true;
        this.#updateTraySelectedPlaced();
        this.#recalculateTimeAndCheckWin();
    }

    rotateSelectedTile(clockwise = true) {
        this.tray.rotateSelected(clockwise);
    }

    rotateTileAt(columnIdx: number, rowIdx: number, clockwise = true) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        const current = this.grid[rowIdx][columnIdx];
        if (current.kind === TileKind.Empty) return;

        const step = clockwise ? 1 : -1;
        this.grid[rowIdx][columnIdx].orientation = normalizeOrientation(current.orientation + step);
        this.#gridDirty = true;
        this.#recalculateTimeAndCheckWin();
    }

    consumeGridDirtyFlag() {
        const changed = this.#gridDirty;
        this.#gridDirty = false;
        return changed;
    }

    tick() {
        // Keep the game state synchronized every frame for UI updates.
        if (this.gameWon) {
            this.statusMessage = "Perfect! You matched the target time.";
        }
    }

    #recalculateTimeAndCheckWin() {
        this.currentTime = this.grid.reduce((sum, row) => {
            return (
                sum +
                row.reduce((rowSum, tile) => {
                    return rowSum + (tile.kind === TileKind.Empty ? 0 : getTileDefinition(tile.kind).timeCost);
                }, 0)
            );
        }, 0);

        this.gameWon = this.#checkWinCondition();
        if (this.gameWon) {
            this.statusMessage = `Perfect! You matched the target time of ${this.targetTime}.`;
        } else if (this.currentTime > this.targetTime) {
            this.statusMessage = `Over target by ${this.currentTime - this.targetTime}.`;
        } else {
            this.statusMessage = `Match the target time of ${this.targetTime}.`;
        }
    }

    #checkWinCondition() {
        return this.targetTime > 0 && this.currentTime === this.targetTime;
    }

    #isValidPosition(columnIdx: number, rowIdx: number) {
        return rowIdx >= 0 && rowIdx < this.grid.length && columnIdx >= 0 && columnIdx < this.grid[0].length;
    }

    #updateTraySelectedPlaced() {
        this.tray.setSelectedPlacedTile(
            !!this.selectedGridCell,
            (clockwise) => {
                if (this.selectedGridCell) {
                    this.rotateTileAt(this.selectedGridCell.column, this.selectedGridCell.row, clockwise);
                }
            },
            () => {
                if (this.selectedGridCell) {
                    this.clearTile(this.selectedGridCell.column, this.selectedGridCell.row);
                }
            },
        );
    }
}
