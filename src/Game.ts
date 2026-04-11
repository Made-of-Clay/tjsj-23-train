import type { GridCell } from "./GridCell.ts";
import type { TileCell, TileOrientation } from "./TileDefinitions.ts";
import { DEFAULT_TILE_CELL, normalizeOrientation, TileKind } from "./TileDefinitions.ts";
import type { SelectedTile, TileTray } from "./TileTray/TileTray.ts";

function createEmptyGrid(rows: number, columns: number): TileCell[][] {
    return Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ ...DEFAULT_TILE_CELL })));
}

export class Game {
    grid: TileCell[][];
    targetTime: number = 0;
    currentTime: number = 0;
    hasUpgrades = false;
    selectedGridCell: GridCell | null = null;
    tray: TileTray;
    #gridDirty = true;

    get selectedTile(): SelectedTile {
        return this.tray.selected;
    }

    constructor(tray: TileTray, columns = 4, rows = 4) {
        this.grid = createEmptyGrid(rows, columns);
        this.tray = tray;
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
    }

    placeSelectedTileAt(columnIdx: number, rowIdx: number) {
        if (!this.tray.canPlaceSelected()) return false;
        if (!this.#isValidPosition(columnIdx, rowIdx)) return false;

        this.setTile(columnIdx, rowIdx, this.selectedTile.kind, this.selectedTile.orientation);
        return this.tray.useSelectedTile();
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
    }

    consumeGridDirtyFlag() {
        const changed = this.#gridDirty;
        this.#gridDirty = false;
        return changed;
    }

    tick() {
        // TODO: update timers, route validation, and game flow.
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
