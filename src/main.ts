import Stats from "stats.js";
import { PCFSoftShadowMap, Plane, Raycaster, Vector2, Vector3, WebGLRenderer } from "three";
import "./style.css";
import { addHelpers } from "./addHelpers";
import { addLights } from "./addLights";
import { Game } from "./Game";
import { getScene } from "./getScene";
import { ProjectCamera } from "./ProjectCamera";
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

    game.toggleTileSelection(column, row);
});

// ===== 📈 STATS & CLOCK =====
const stats = new Stats();
document.body.appendChild(stats.dom);

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
