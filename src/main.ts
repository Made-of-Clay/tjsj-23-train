import Stats from "stats.js";
import { PCFSoftShadowMap, Plane, Raycaster, Vector2, Vector3, WebGLRenderer } from "three";
import "./style.css";
import { addHelpers } from "./addHelpers";
import { addLights } from "./addLights";
import { Game } from "./Game";
import { getGui, guiConf } from "./getGui";
import { getScene } from "./getScene";
import { ProjectCamera } from "./ProjectCamera";
import { TILE_DEFINITIONS, TileKind } from "./TileDefinitions";
import { TileRenderer } from "./TileRenderer";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

addLights();

const camera = new ProjectCamera(canvas);
scene.add(camera.instance);

addHelpers();

const game = new Game();
const tileRenderer = new TileRenderer(scene);
tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);

const orientationOptions = ["N", "E", "S", "W"];
function getOrientationLabel(orientation: number) {
    return orientationOptions[orientation] ?? "N/A";
}

const trayState = createTileTray(game);
document.body.appendChild(trayState.root);
game.tray.updateUI(trayState, getOrientationLabel);

const raycaster = new Raycaster();
const pointer = new Vector2();
const clickPlane = new Plane(new Vector3(0, 1, 0), 0);
const intersectionPoint = new Vector3();

canvas.addEventListener("pointerdown", (event) => {
    pointer.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    pointer.y = -(event.clientY / canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera.instance);
    if (!raycaster.ray.intersectPlane(clickPlane, intersectionPoint)) return;

    const halfWidth = game.grid[0].length * 0.5;
    const halfDepth = game.grid.length * 0.5;
    const column = Math.floor(intersectionPoint.x + halfWidth);
    const row = Math.floor(intersectionPoint.z + halfDepth);

    if (column < 0 || column >= game.grid[0].length || row < 0 || row >= game.grid.length) return;

    const cell = game.grid[row][column];
    if (cell.kind === TileKind.Empty && game.tray.canPlaceSelected() && game.placeSelectedTileAt(column, row)) {
        game.tray.updateUI(trayState, getOrientationLabel);
        return;
    }

    game.toggleTileSelection(column, row);
});

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);
handleStatsDisplay(guiConf.showStats);

const gui = getGui();
gui.add(guiConf, "showStats").name("Show Stats").onChange(handleStatsDisplay);

function handleStatsDisplay(value: boolean) {
    stats.dom.style.setProperty("display", value ? "block" : "none");
    value ? stats.begin() : stats.end();
}

// TODO use camelCase__BEM instead of kebab-case__BEM
// TOOD extract tileTray markup/style into
function createTileTray(game: Game) {
    const root = document.createElement("aside");
    root.className = "tileTray";

    const heading = document.createElement("div");
    heading.className = "tileTray__header";
    heading.textContent = "Tile Tray";
    root.appendChild(heading);

    const list = document.createElement("div");
    list.className = "tileTray__list";

    const buttons: HTMLButtonElement[] = [];
    for (const entry of game.tray.entries) {
        const tileDef = TILE_DEFINITIONS[entry.kind];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "tileTray__item";
        button.dataset.kind = String(entry.kind);
        button.innerHTML = `
            <span class="tileTray__item-label">${tileDef.name}</span>
            <span class="tileTray__item-count">${entry.count}</span>
        `;
        button.addEventListener("click", () => {
            game.tray.selectKind(entry.kind);
            game.tray.updateUI(trayState, getOrientationLabel);
        });
        list.appendChild(button);
        buttons.push(button);
    }

    const controls = document.createElement("div");
    controls.className = "tileTray__controls";

    const rotateLeft = document.createElement("button");
    rotateLeft.type = "button";
    rotateLeft.className = "tileTray__rotate";
    rotateLeft.textContent = "⟲";
    rotateLeft.title = "Rotate counterclockwise";
    rotateLeft.addEventListener("click", () => {
        game.tray.rotateSelected(false);
        game.tray.updateUI(trayState, getOrientationLabel);
    });

    const orientationLabel = document.createElement("span");
    orientationLabel.className = "tileTray__orientation";

    const rotateRight = document.createElement("button");
    rotateRight.type = "button";
    rotateRight.className = "tileTray__rotate";
    rotateRight.textContent = "⟳";
    rotateRight.title = "Rotate clockwise";
    rotateRight.addEventListener("click", () => {
        game.tray.rotateSelected(true);
        game.tray.updateUI(trayState, getOrientationLabel);
    });

    controls.append(rotateLeft, orientationLabel, rotateRight);
    root.appendChild(list);
    root.appendChild(controls);

    return { root, buttons, orientationLabel } as const;
}

function tick() {
    requestAnimationFrame(tick);

    stats.begin();

    camera.tick(renderer);
    game.tick();

    if (game.consumeGridDirtyFlag()) {
        tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);
    }

    renderer.render(scene, camera.instance);
    stats.end();
}

tick();
