import Stats from "stats.js";
import { PCFSoftShadowMap, Timer, WebGLRenderer } from "three";
import "./style.css";
import { addHelpers } from "./addHelpers";
import { addLights } from "./addLights";
import { getGui, guiConf } from "./getGui";
import { getScene } from "./getScene";
import { ProjectCamera } from "./ProjectCamera";
import { Train } from "./Train";

// TODO add nice skybox for blue skies or space -- probably blue skies to match more playful theme
const canvas = document.createElement("canvas");
canvas.className = "scene-canvas";
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

const train = new Train();
train.ready.then(() => {
    // TODO add some loading screen or something, this is pretty jarring
    console.log("Train model loaded");
});

const timer = new Timer();

function tick(time: number) {
    requestAnimationFrame(tick);

    timer.update(time);

    if (gui && stats) stats.begin();

    const delta = timer.getDelta();
    train.animate(delta);
    camera.tick(renderer);
    renderer.render(scene, camera.instance);

    if (gui && stats) stats.end();
}

tick(0);
