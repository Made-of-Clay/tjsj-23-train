import type { Mesh } from "three";
import { type GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getScene } from "./getScene";

export class Train {
    ready: Promise<void>;

    constructor() {
        this.ready = this.#init();
    }

    async #init(): Promise<void> {
        await this.#loadAssets();
        this.#adjustRotation();
        this.#addGrass();
    }

    #loadAssets(): Promise<void> {
        const loader = new GLTFLoader();

        return new Promise((resolve, reject) => {
            loader.load(
                "/models/train-planet.gltf",
                (gltf: GLTF) => {
                    const model = gltf.scene;
                    if (!model) {
                        reject(new ReferenceError("GLTF scene missing"));
                        return;
                    }

                    model.traverse((child) => {
                        if ((child as Mesh).isMesh) {
                            const mesh = child as Mesh;
                            // TODO evaluate this - not sure about it
                            mesh.castShadow = true;
                            mesh.receiveShadow = true;
                        }
                    });

                    getScene().add(model);
                    resolve();
                },
                undefined,
                (error) => reject(error),
            );
        });
    }

    #adjustRotation() {}

    #addGrass() {
        // TODO implement
        // add some grass planes with alpha textures to hide the hard edges of the train model
    }

    animate() {
        // TODO implement
    }

    toggleDirection() {
        // TODO implement
        // use gsap to change train's animation direction (reverse or forward)
        // TODO tinker with timing functions for nice slow down and dir change
    }
}
