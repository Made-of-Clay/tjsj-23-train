import Stats from "stats.js";
import { PCFSoftShadowMap, Plane, Raycaster, Vector2, Vector3, WebGLRenderer } from "three";
import "./style.css";
import { addHelpers } from "./addHelpers";
import { addLights } from "./addLights";
import { Game } from "./Game";
import { getGui, guiConf } from "./getGui";
import { getScene } from "./getScene";
import { ProjectCamera } from "./ProjectCamera";
import { TileKind } from "./TileDefinitions";
import { TileRenderer } from "./TileRenderer";
import type { TileTray } from "./TileTray/TileTray.ts";

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

const tray = document.querySelector<TileTray>("tile-tray");
if (!tray)
    throw new ReferenceError("TileTray element not found. Make sure <tile-tray></tile-tray> is present in the HTML.");
const game = new Game(tray);
const tileRenderer = new TileRenderer(scene);
tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);

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

    if (column < 0 || column >= game.grid[0].length || row < 0 || row >= game.grid.length) {
        game.clearSelectedGridCell();
        return;
    }

    const cell = game.grid[row][column];
    if (cell.kind === TileKind.Empty && game.tray.canPlaceSelected() && game.placeSelectedTileAt(column, row)) {
        game.toggleTileSelection(column, row); // i.e. auto-select newly-placed tile
        return;
    }

    game.toggleTileSelection(column, row);
});

// ===== 📈 STATS & CLOCK =====
let stats: Stats | null = null;
const gui = getGui();
if (gui) {
    stats = new Stats();
    const handleStatsDisplay = (showStats: boolean) =>
        stats?.dom.style.setProperty("display", showStats ? "block" : "none");
    document.body.appendChild(stats.dom);
    handleStatsDisplay(guiConf.showStats);

    if (gui) {
        gui.add(guiConf, "showStats")
            .name("Show Stats")
            .onChange((value: boolean) => {
                if (stats) {
                    handleStatsDisplay(value);
                    value ? stats.begin() : stats.end();
                }
            });
    }
}

function tick() {
    requestAnimationFrame(tick);

    if (gui && stats) stats.begin();

    camera.tick(renderer);
    game.tick();

    if (game.consumeGridDirtyFlag()) {
        tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);
    }

    renderer.render(scene, camera.instance);

    if (gui && stats) stats.end();
}

tick();
