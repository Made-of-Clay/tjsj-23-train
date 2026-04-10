import type { TileOrientation } from "./TileDefinitions.ts";
import { TileKind } from "./TileDefinitions.ts";

export interface TileTrayEntry {
    kind: TileKind;
    count: number;
}

export interface SelectedTile {
    kind: TileKind;
    orientation: TileOrientation;
}

export interface TrayUIState {
    buttons: HTMLButtonElement[];
    orientationLabel: HTMLSpanElement;
}

export class TileTray {
    entries: TileTrayEntry[];
    selected: SelectedTile;

    constructor() {
        this.entries = [
            { kind: TileKind.Straight, count: 8 },
            { kind: TileKind.Curve, count: 6 },
            { kind: TileKind.Station, count: 2 },
        ];
        this.selected = {
            kind: TileKind.Straight,
            orientation: 0,
        };
    }

    selectKind(kind: TileKind) {
        if (kind === TileKind.Empty) return;
        this.selected.kind = kind;
    }

    rotateSelected(clockwise = true) {
        if (this.selected.kind === TileKind.Empty) return;
        const step = clockwise ? 1 : -1;
        this.selected.orientation = (((this.selected.orientation + step) % 4) + 4) % 4;
    }

    getCount(kind: TileKind) {
        return this.entries.find((entry) => entry.kind === kind)?.count ?? 0;
    }

    canPlaceSelected() {
        return this.selected.kind !== TileKind.Empty && this.getCount(this.selected.kind) > 0;
    }

    useSelectedTile() {
        const entry = this.entries.find((item) => item.kind === this.selected.kind);
        if (!entry || entry.count === 0) return false;
        entry.count -= 1;
        return true;
    }

    updateUI(state: TrayUIState, getOrientationLabel: (orientation: number) => string) {
        const selectedKind = this.selected.kind;

        for (let index = 0; index < this.entries.length; index += 1) {
            const entry = this.entries[index];
            const button = state.buttons[index];
            const isSelected = entry.kind === selectedKind;

            button.classList.toggle("selected", isSelected);
            button.disabled = entry.count === 0;

            const countSpan = button.querySelector(".tileTray__item-count");
            if (countSpan) {
                countSpan.textContent = String(entry.count);
            }
        }

        state.orientationLabel.textContent = `Orientation: ${getOrientationLabel(this.selected.orientation)}`;
    }
}
