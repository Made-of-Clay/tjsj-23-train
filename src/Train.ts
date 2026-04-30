import { AnimationMixer, type Group, type Mesh, MeshToonMaterial, type Object3DEventMap } from "three";
import { type GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getGui } from "./getGui";
import { getScene } from "./getScene";

export class Train {
    ready: Promise<void>;
    model: Group<Object3DEventMap> | null = null;
    #mixer: AnimationMixer | null = null;

    constructor() {
        this.ready = this.#init();
    }

    async #init(): Promise<void> {
        await this.#loadAssets();
        this.#adjustRotation();
        this.#addGrass();
        // this.#toonify();
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
                        console.log(child, `animations = ${child.animations.length}`);
                        // if ((child as Mesh).isMesh) {
                        //     const mesh = child as Mesh;
                        //     // TODO evaluate this - not sure about it
                        //     mesh.castShadow = true;
                        //     mesh.receiveShadow = true;
                        // }
                    });

                    this.#mixer = new AnimationMixer(model);
                    if (!gltf.animations[0]) {
                        console.error("No animations available", gltf.animations);
                    }
                    const action = this.#mixer.clipAction(gltf.animations[0]);
                    action.play();

                    this.model = model;
                    getScene().add(model);
                    resolve();
                },
                undefined,
                (error) => reject(error),
            );
        });
    }

    #adjustRotation() {
        if (!this.model) return console.warn("No model somehow");
        this.model.rotation.x = 0;
        this.model.rotation.y = 3.5;
        this.model.rotation.z = 0.7;
        const gui = getGui();
        const trainFolder = gui?.addFolder("Train");
        if (trainFolder) {
            trainFolder
                .add(this.model.rotation, "x")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Rotation X");
            trainFolder
                .add(this.model.rotation, "y")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Rotation Y");
            trainFolder
                .add(this.model.rotation, "z")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Rotation Z");
        }
    }

    #addGrass() {
        // TODO implement
        // add some grass planes with alpha textures to hide the hard edges of the train model
    }

    // @ts-expect-error dev testing
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: dev testing
    #toonify() {
        this.model?.traverse((child) => {
            if ((child as Mesh).isMesh) {
                const mesh = child as Mesh;
                const originalMaterial = mesh.material;
                if (originalMaterial && typeof (originalMaterial as any).color !== "undefined") {
                    const color = (originalMaterial as any).color;
                    mesh.material = new MeshToonMaterial({ color });
                }
            }
        });
    }

    animate(deltaTime: number) {
        if (this.#mixer) {
            this.#mixer.update(deltaTime);
        }
        if (this.model) {
            this.model.rotation.y += deltaTime * 0.1;
        }
    }

    toggleDirection() {
        // TODO implement
        // use gsap to change train's animation direction (reverse or forward)
        // TODO tinker with timing functions for nice slow down and dir change
    }
}
