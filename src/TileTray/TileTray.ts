import { TILE_DEFINITIONS, TileKind } from "../TileDefinitions.ts";
import template from "./TileTray.html?raw";

export interface TileTrayEntry {
    kind: TileKind;
    count: number;
}

export interface SelectedTile {
    kind: TileKind;
    orientation: number;
}

const ORIENTATION_LABELS = ["N", "E", "S", "W"];

export class TileTray extends HTMLElement {
    #entries: TileTrayEntry[];
    #selected: SelectedTile;
    #buttons: HTMLButtonElement[] = [];
    #orientationLabel: HTMLSpanElement | null = null;
    #rotateLeftBtn: HTMLButtonElement | null = null;
    #rotateRightBtn: HTMLButtonElement | null = null;
    #listContainer: HTMLElement | null = null;
    #hasSelectedPlacedTile: boolean = false;
    #onRotatePlaced: ((clockwise: boolean) => void) | null = null;
    #onRemovePlaced: (() => void) | null = null;
    #onSelectKind: ((kind: TileKind) => void) | null = null;
    #removeBtn: HTMLButtonElement | null = null;

    get entries(): TileTrayEntry[] {
        return this.#entries;
    }

    get selected(): SelectedTile {
        return this.#selected;
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        this.#entries = [
            { kind: TileKind.Straight, count: 8 },
            { kind: TileKind.Curve, count: 6 },
            { kind: TileKind.Station, count: 2 },
        ];
        this.#selected = {
            kind: TileKind.Straight,
            orientation: 0,
        };
    }

    connectedCallback() {
        if (!this.shadowRoot) return console.error("no shadow root");

        // Parse template string into a temporary container
        const temp = document.createElement("div");
        temp.innerHTML = template;
        const templateElement = temp.querySelector("template");
        if (!templateElement) return console.error("no template element found");

        // Clone and append template content to shadow root
        const content = templateElement.content.cloneNode(true);
        this.shadowRoot.appendChild(content);

        this.#listContainer = this.shadowRoot.querySelector(".tileTray__list");
        this.#orientationLabel = this.shadowRoot.querySelector(".tileTray__orientation");
        const controls = this.shadowRoot.querySelector(".tileTray__controls");

        if (!this.#listContainer || !controls) return console.error("no list container or controls");

        // Create tile buttons from entries
        this.#buttons = [];
        for (const entry of this.#entries) {
            const tileDef = TILE_DEFINITIONS[entry.kind];
            const button = document.createElement("button");
            button.type = "button";
            button.className = "tileTray__item";
            button.dataset.kind = String(entry.kind);
            button.innerHTML = `
                <span class="tileTray__itemLabel">${tileDef.name}</span>
                <span class="tileTray__itemCount">${entry.count}</span>
            `;
            button.addEventListener("click", () => this.#handleSelectKind(entry.kind));
            this.#listContainer.appendChild(button);
            this.#buttons.push(button);
        }

        // Set up rotate buttons
        const rotateButtons = controls.querySelectorAll(".tileTray__rotate");
        if (rotateButtons.length >= 2) {
            this.#rotateLeftBtn = rotateButtons[0] as HTMLButtonElement;
            this.#rotateRightBtn = rotateButtons[1] as HTMLButtonElement;

            this.#rotateLeftBtn.addEventListener("click", () => this.#handleRotate(true)); // clockwise
            this.#rotateRightBtn.addEventListener("click", () => this.#handleRotate(false)); // counterclockwise
        }

        // Set up remove button
        this.#removeBtn = this.shadowRoot.querySelector(".tileTray__remove");
        if (this.#removeBtn) {
            this.#removeBtn.addEventListener("click", () => this.#handleRemove());
        }

        this.#updateUI();
    }

    selectKind(kind: TileKind) {
        if (kind === TileKind.Empty) return;
        this.#selected.kind = kind;
        this.#updateUI();
    }

    setSelectedPlacedTile(hasSelected: boolean, onRotate: (clockwise: boolean) => void, onRemove: () => void) {
        this.#hasSelectedPlacedTile = hasSelected;
        this.#onRotatePlaced = onRotate;
        this.#onRemovePlaced = onRemove;
        this.#updateUI();
    }

    setOnSelectKind(callback: (kind: TileKind) => void) {
        this.#onSelectKind = callback;
    }

    rotateSelected(clockwise = true) {
        if (this.#selected.kind === TileKind.Empty) return;
        const step = clockwise ? 1 : -1;
        this.#selected.orientation = (((this.#selected.orientation + step) % 4) + 4) % 4;
        this.#updateUI();
    }

    getCount(kind: TileKind): number {
        return this.#entries.find((entry) => entry.kind === kind)?.count ?? 0;
    }

    canPlaceSelected(): boolean {
        return this.#selected.kind !== TileKind.Empty && this.getCount(this.#selected.kind) > 0;
    }

    useSelectedTile(): boolean {
        const entry = this.#entries.find((item) => item.kind === this.#selected.kind);
        if (!entry || entry.count === 0) return false;
        entry.count -= 1;
        this.#updateUI();
        return true;
    }

    #handleSelectKind(kind: TileKind) {
        this.selectKind(kind);
        if (this.#onSelectKind) this.#onSelectKind(kind);
    }

    #handleRotate(clockwise: boolean) {
        if (this.#hasSelectedPlacedTile && typeof this.#onRotatePlaced === "function") {
            this.#onRotatePlaced(clockwise);
        } else {
            this.rotateSelected(clockwise);
        }
    }

    #handleRemove() {
        if (this.#hasSelectedPlacedTile && typeof this.#onRemovePlaced === "function") {
            this.#onRemovePlaced();
        }
    }

    #updateUI() {
        if (!this.shadowRoot) return;

        const selectedKind = this.#selected.kind;

        // Update tile buttons
        for (let index = 0; index < this.#entries.length; index += 1) {
            const entry = this.#entries[index];
            const button = this.#buttons[index];
            const isSelected = entry.kind === selectedKind;

            button.classList.toggle("selected", isSelected);
            button.disabled = entry.count === 0;

            const countSpan = button.querySelector(".tileTray__itemCount");
            if (countSpan) {
                countSpan.textContent = String(entry.count);
            }
        }

        // Update orientation label
        if (this.#orientationLabel) {
            const label = ORIENTATION_LABELS[this.#selected.orientation] ?? "N/A";
            this.#orientationLabel.textContent = `Orientation: ${label}`;
        }

        // Update remove button visibility
        if (this.#removeBtn) {
            this.#removeBtn.style.display = this.#hasSelectedPlacedTile ? "block" : "none";
        }
    }
}

customElements.define("tile-tray", TileTray);
