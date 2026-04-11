import { AxesHelper, GridHelper } from "three";
import { getGui } from "./getGui";
import { getScene } from "./getScene";

export function addHelpers() {
    const scene = getScene();
    const gui = getGui();
    const helpersFolder = gui?.addFolder("Helpers");

    const axesHelper = new AxesHelper(4);
    axesHelper.visible = false;
    scene.add(axesHelper);
    if (helpersFolder) {
        helpersFolder.add(axesHelper, "visible").name("axes");
    }

    const gridHelper = new GridHelper(20, 20, "teal", "darkgray");
    gridHelper.position.y = -0.01;
    gridHelper.visible = false;
    scene.add(gridHelper);
    if (helpersFolder) {
        helpersFolder.add(gridHelper, "visible").name("grid");
    }
}
