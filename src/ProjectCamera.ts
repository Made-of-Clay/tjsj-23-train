import type GUI from "lil-gui";
import { PerspectiveCamera, type WebGLRenderer } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getGui } from "./getGui";
import { resizeRendererToDisplaySize } from "./helpers/responsiveness";

export class ProjectCamera {
    instance: PerspectiveCamera;
    #canvas: HTMLCanvasElement;
    #controls: OrbitControls;
    zoom: number = 1;
    #cameraFolder: GUI | null = null;

    constructor(canvas: HTMLCanvasElement) {
        const gui = getGui();
        if (gui) {
            this.#cameraFolder = gui.addFolder("Camera");
        }

        this.#canvas = canvas;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const aspect = width / height;
        this.instance = new PerspectiveCamera(45, aspect, 0.1, 1000);
        this.instance.position.set(30, 4, 30);
        this.instance.lookAt(0, 0, 0);

        this.#controls = new OrbitControls(this.instance, this.#canvas);
        this.#controls.enableDamping = true;
        this.#controls.dampingFactor = 0.08;

        this.#addGuiControls();
        this.#updateCameraZoom();
    }

    #addGuiControls() {
        if (!this.#cameraFolder) return;

        const lookAtCenter = () => this.instance.lookAt(0, 0, 0);
        this.#cameraFolder.add(this.instance.position, "x", -10, 10, 0.1).onChange(lookAtCenter);
        this.#cameraFolder.add(this.instance.position, "y", -10, 10, 0.1).onChange(lookAtCenter);
        this.#cameraFolder.add(this.instance.position, "z", -10, 10, 0.1).onChange(lookAtCenter);

        this.#cameraFolder
            .add(this, "zoom")
            .name("Zoom")
            .onChange(() => {
                this.#updateCameraZoom();
            });
    }

    #updateCameraZoom() {
        const aspect = this.#canvas.clientWidth / this.#canvas.clientHeight;
        this.instance.aspect = aspect;
        this.instance.zoom = this.zoom;
        this.instance.updateProjectionMatrix();
    }

    tick(renderer: WebGLRenderer) {
        if (resizeRendererToDisplaySize(renderer)) {
            this.#updateCameraZoom();
        }

        this.#controls.update();
    }
}
