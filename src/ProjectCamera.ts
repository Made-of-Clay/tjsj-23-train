import type GUI from "lil-gui";
import { OrthographicCamera, type WebGLRenderer } from "three";
import { getGui } from "./getGui";
import { resizeRendererToDisplaySize } from "./helpers/responsiveness";

export class ProjectCamera {
    instance: OrthographicCamera;
    #canvas: HTMLCanvasElement;
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
        const viewHeight = 5;
        const viewWidth = viewHeight * aspect;
        this.instance = new OrthographicCamera(
            -viewWidth / 2,
            viewWidth / 2,
            viewHeight / 2,
            -viewHeight / 2,
            0.1,
            1000,
        );
        this.instance.position.set(6, 4, 6);
        this.instance.lookAt(0, 0, 0);

        this.#addGuiControls();
        this.#updateCameraZoom();
        this.#handleEvents();
    }

    #addGuiControls() {
        if (!this.#cameraFolder) return;

        const lookAtCenter = () => this.instance.lookAt(0, 0, 0);
        this.#cameraFolder.add(this.instance.position, "x", -10, 10, 0.1).onChange(lookAtCenter);
        this.#cameraFolder.add(this.instance.position, "y", -10, 10, 0.1).onChange(lookAtCenter);
        this.#cameraFolder.add(this.instance.position, "z", -10, 10, 0.1).onChange(lookAtCenter);

        this.#cameraFolder
            .add(this, "zoom", 0.5, 5, 0.1)
            .name("Zoom")
            .onChange(() => {
                this.#updateCameraZoom();
            });
    }

    #handleEvents() {
        this.#canvas.addEventListener(
            "wheel",
            (event) => {
                event.preventDefault();
                const zoomSpeed = 0.1;
                const direction = event.deltaY > 0 ? 1 : -1;
                this.zoom = Math.max(0.5, Math.min(5, this.zoom + direction * zoomSpeed));
                this.#updateCameraZoom();
            },
            { passive: false },
        );
    }

    #updateCameraZoom() {
        const aspect = this.#canvas.clientWidth / this.#canvas.clientHeight;
        const viewHeight = 5 / this.zoom;
        const viewWidth = viewHeight * aspect;
        this.instance.left = -viewWidth / 2;
        this.instance.right = viewWidth / 2;
        this.instance.top = viewHeight / 2;
        this.instance.bottom = -viewHeight / 2;
        this.instance.updateProjectionMatrix();
    }

    tick(renderer: WebGLRenderer) {
        if (resizeRendererToDisplaySize(renderer)) {
            this.#updateCameraZoom();
        }
    }
}
