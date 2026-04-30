import { AmbientLight, DirectionalLight, DirectionalLightHelper } from "three";
import { getGui } from "./getGui";
import { getScene } from "./getScene";

export function addLights() {
    const scene = getScene();
    const gui = getGui();
    const lightsFolder = gui?.addFolder("Lights");

    const ambientLight = new AmbientLight("white", 0.25);
    scene.add(ambientLight);

    if (lightsFolder) {
        lightsFolder.add(ambientLight, "visible").name("Ambient Light");
    }

    const dirLight = new DirectionalLight("white", 2);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    if (lightsFolder) {
        lightsFolder.add(dirLight, "visible").name("Directional Light");
        lightsFolder.add(dirLight, "intensity").min(0).max(2).step(0.01).name("Directional Light Intensity");
        const dirLightHelper = new DirectionalLightHelper(dirLight, 0.25, "orange");
        dirLightHelper.visible = false;
        lightsFolder.add(dirLightHelper, "visible").name("Directional Light Helper");
        scene.add(dirLightHelper);
    }
}
