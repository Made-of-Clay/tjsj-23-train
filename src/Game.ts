import type { GridCell } from "./GridCell.ts";
import type { TileCell, TileOrientation } from "./TileDefinitions.ts";
import { DEFAULT_TILE_CELL, normalizeOrientation, TileKind } from "./TileDefinitions.ts";
import type { SelectedTile } from "./TileTray.ts";
import { TileTray } from "./TileTray.ts";

function createEmptyGrid(rows: number, columns: number): TileCell[][] {
    return Array.from({ length: rows }, () => Array.from({ length: columns }, () => ({ ...DEFAULT_TILE_CELL })));
}

export class Game {
    grid: TileCell[][];
    targetTime: number = 0;
    currentTime: number = 0;
    hasUpgrades = false;
    selectedTile: SelectedTile;
    selectedGridCell: GridCell | null = null;
    tray: TileTray;
    #gridDirty = true;

    constructor(columns = 4, rows = 4) {
        this.grid = createEmptyGrid(rows, columns);
        this.tray = new TileTray();
        this.selectedTile = this.tray.selected;
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
    }

    rotateSelectedTile(clockwise = true) {
        const step = clockwise ? 1 : -1;
        this.selectedTile.orientation = normalizeOrientation(this.selectedTile.orientation + step);
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
}
