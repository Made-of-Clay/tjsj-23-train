import { Color, Scene } from "three";

let scene: Scene;

export function getScene() {
    if (!scene) {
        scene = new Scene();
        scene.background = new Color(0x86c7ff);
    }

    return scene;
}
