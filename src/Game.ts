import type { GridCell } from "./GridCell.ts";
import { getRandPuzzle, type Puzzle } from "./PuzzleDefinition.ts";
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
    grid: TileCell[][] | null = null;
    puzzle: Puzzle | null = null;
    currentTime: number = 0;
    gameWon = false;
    statusMessage = "";
    hasUpgrades = false;
    selectedGridCell: GridCell | null = null;
    tray: TileTray | null = null;
    #gridDirty = true;
    ready: Promise<void>;

    get selectedTile(): SelectedTile | null {
        return this.tray?.selected ?? null;
    }

    constructor() {
        this.ready = this.#init();
    }

    async #init() {
        this.#fetchTray();
        await this.#fetchPuzzle();

        if (!this.tray) {
            throw new ReferenceError("TileTray instance not available after fetching.");
        }
        if (!this.puzzle) {
            throw new ReferenceError("Puzzle data not available after fetching.");
        }
        this.tray.setInventory(this.puzzle.tileInventory);

        this.#setGrid();
        this.#setStatusMessage();
        this.#recalculateTimeAndCheckWin();
        this.tray?.setOnSelectKind(() => {
            this.selectedGridCell = null;
            this.#gridDirty = true;
            this.#updateTraySelectedPlaced();
        });
        this.#updateTraySelectedPlaced();
    }

    #fetchTray() {
        const tray = document.querySelector<TileTray>("tile-tray");
        if (!tray) {
            throw new ReferenceError(
                "TileTray element not found. Make sure <tile-tray></tile-tray> is present in the HTML.",
            );
        }
        this.tray = tray;
    }

    async #fetchPuzzle(): Promise<void> {
        const puzzle = await getRandPuzzle();
        if (!puzzle) {
            throw new ReferenceError("Failed to fetch a random puzzle.");
        }
        this.puzzle = puzzle;
    }

    #setGrid() {
        if (!this.puzzle) {
            throw new ReferenceError("Puzzle not loaded yet.");
        }
        // Convert initTiles (number[][]) to TileCell[][], assuming default North orientation
        this.grid = this.puzzle.initTiles.map((row) =>
            row.map((kind) => ({
                kind: kind as TileKind,
                orientation: TileOrientation.North,
            })),
        );
    }

    #setStatusMessage() {
        if (!this.puzzle) {
            throw new ReferenceError("Puzzle not loaded yet.");
        }
        if ((this.puzzle?.targetTime ?? 0) <= 0) {
            throw new Error("Invalid puzzle: targetTime must be greater than 0.");
        }
        this.statusMessage = `Match the target time of ${this.puzzle.targetTime}.`;
    }

    setTile(columnIdx: number, rowIdx: number, kind: TileKind, orientation: TileOrientation) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        if (!this.grid) {
            throw new ReferenceError("Grid not initialized yet.");
        }

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
        if (!this.tray?.canPlaceSelected()) return false;
        if (!this.#isValidPosition(columnIdx, rowIdx)) return false;

        if (!this.selectedTile) {
            throw new ReferenceError(
                "Selected tile is null. This should not happen if canPlaceSelected() returned true.",
            );
        }

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
            throw new Error("Attempted to clear a tile that wasn't selected. This should not happen.");
        }

        if (!this.grid) {
            throw new ReferenceError("Grid not initialized yet.");
        }

        this.grid[rowIdx][columnIdx] = { ...DEFAULT_TILE_CELL };
        this.#gridDirty = true;
        this.#updateTraySelectedPlaced();
        this.#recalculateTimeAndCheckWin();
    }

    rotateSelectedTile(clockwise = true) {
        this.tray?.rotateSelected(clockwise);
    }

    rotateTileAt(columnIdx: number, rowIdx: number, clockwise = true) {
        if (!this.#isValidPosition(columnIdx, rowIdx)) return;

        if (!this.grid) {
            throw new ReferenceError("Grid not initialized yet.");
        }

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
        if (!this.puzzle) {
            throw new ReferenceError("Puzzle not loaded yet.");
        }

        if (!this.grid) {
            throw new ReferenceError("Grid not initialized yet.");
        }

        this.currentTime = this.grid.reduce((sum, row) => {
            return (
                sum +
                row.reduce(
                    (rowSum, tile) =>
                        rowSum + (tile.kind === TileKind.Empty ? 0 : getTileDefinition(tile.kind).timeCost),
                    0,
                )
            );
        }, 0);

        this.gameWon = this.#checkWinCondition();
        if (this.gameWon) {
            this.statusMessage = `Perfect! You matched the target time of ${this.puzzle.targetTime}.`;
        } else if (this.currentTime > this.puzzle.targetTime) {
            this.statusMessage = `Over target by ${this.currentTime - this.puzzle.targetTime}.`;
        } else {
            this.statusMessage = `Match the target time of ${this.puzzle.targetTime}.`;
        }
        console.log(this.statusMessage, this.currentTime, this.puzzle.targetTime);
    }

    #checkWinCondition() {
        if (!this.puzzle) {
            throw new ReferenceError("Puzzle not loaded yet.");
        }
        return this.puzzle.targetTime > 0 && this.currentTime === this.puzzle.targetTime;
    }

    #isValidPosition(columnIdx: number, rowIdx: number) {
        if (!this.grid) {
            throw new ReferenceError("Grid not initialized yet.");
        }

        return rowIdx >= 0 && rowIdx < this.grid.length && columnIdx >= 0 && columnIdx < this.grid[0].length;
    }

    #updateTraySelectedPlaced() {
        this.tray?.setSelectedPlacedTile(
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
