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

function createTimeDisplayElement() {
    const container = document.createElement("div");
    container.id = "time-display";
    container.innerHTML = `
        <div class="timeDisplay__title">Time Target</div>
        <div class="timeDisplay__value" id="time-display-value">0 / 0</div>
        <div class="timeDisplay__message" id="time-display-message"></div>
    `;
    document.body.appendChild(container);
    return container;
}

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const timeOverlay = createTimeDisplayElement();
const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
const scene = getScene();

addLights();

const camera = new ProjectCamera(canvas);
scene.add(camera.instance);

addHelpers();

let tileRenderer: TileRenderer;

const game = new Game();
game.ready
    .then(() => {
        if (!game) {
            throw new ReferenceError("Game instance is not available after initialization.");
        }
        if (!game.puzzle) {
            throw new ReferenceError("Puzzle data is not available in the Game instance.");
        }
        if (!game.grid?.length || !game.grid[0].length) {
            throw new ReferenceError("Grid data is not available in the Game instance.");
        }
        tileRenderer = new TileRenderer(scene, game.puzzle.initTiles[0].length, game.puzzle.initTiles.length);
        tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);

        const raycaster = new Raycaster();
        const pointer = new Vector2();
        const clickPlane = new Plane(new Vector3(0, 1, 0), 0);
        const intersectionPoint = new Vector3();

        canvas.addEventListener("pointerdown", (event) => {
            if (!game.grid?.length || !game.grid[0].length) {
                throw new ReferenceError("Grid data is not available in the Game instance.");
            }
            if (!game.tray) {
                throw new ReferenceError("TileTray instance is not available in the Game instance.");
            }

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
    })
    .catch((error) => {
        console.error("Failed to initialize the game:", error);
        alert("An error occurred while initializing the game. Please try again later.");
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

function updateTimeDisplay(game: Game, display: HTMLElement) {
    const value = display.querySelector<HTMLDivElement>("#time-display-value");
    const message = display.querySelector<HTMLDivElement>("#time-display-message");
    if (!value || !message || !game.puzzle) return;

    if (game.puzzle?.targetTime <= 0) {
        throw new ReferenceError("Game instance does not have a valid targetTime property.");
    }

    value.textContent = `${game.currentTime} / ${game.puzzle.targetTime}`;
    display.classList.toggle(
        "timeDisplay--green",
        game.currentTime === game.puzzle.targetTime && game.puzzle.targetTime > 0,
    );
    display.classList.toggle("timeDisplay--red", game.currentTime > game.puzzle.targetTime);
    display.classList.toggle("timeDisplay--neutral", game.currentTime < game.puzzle.targetTime);
    message.textContent = game.statusMessage;
}

function tick() {
    requestAnimationFrame(tick);

    if (gui && stats) stats.begin();

    camera.tick(renderer);
    game.tick();

    if (game.consumeGridDirtyFlag() && game.grid) {
        tileRenderer.updateFromGrid(game.grid, game.selectedGridCell);
    }

    updateTimeDisplay(game, timeOverlay);
    renderer.render(scene, camera.instance);

    if (gui && stats) stats.end();
}

tick();
