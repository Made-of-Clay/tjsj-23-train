import type GUI from "lil-gui";
import {
    AnimationMixer,
    type Group,
    IcosahedronGeometry,
    Mesh,
    MeshStandardMaterial,
    MeshToonMaterial,
    type Object3D,
    type Object3DEventMap,
    Vector3,
} from "three";
import { type GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { getGui } from "./getGui";
import { getScene } from "./getScene";

export class Train {
    ready: Promise<void>;
    model: Group<Object3DEventMap> | null = null;
    #mixer: AnimationMixer | null = null;
    #smokestack: Object3D | null = null;
    poofSpawnAccumulator = 0;
    poofSpawnInterval = 0.2;
    poofLifetime = 2;
    poofSpeed = 2;
    poofInitialOffset = 4;
    poofOpacity = 0.6;
    #poofs: Array<{
        mesh: Mesh<IcosahedronGeometry, MeshStandardMaterial>;
        age: number;
        velocity: Vector3;
    }> = [];
    shouldRotatePlanet = true;
    #guiFolder: GUI | null = null;

    constructor() {
        this.ready = this.#init();

        const gui = getGui();
        this.#guiFolder = gui?.addFolder("Train") ?? null;
        if (this.#guiFolder) {
            this.#guiFolder.add(this, "poofSpawnInterval").min(0.05).max(1).step(0.05).name("Poof Spawn Interval");
            this.#guiFolder.add(this, "poofLifetime").min(0.5).max(5).step(0.5).name("Poof Lifetime");
            this.#guiFolder.add(this, "poofSpeed").min(0.5).max(5).step(0.5).name("Poof Speed");
            this.#guiFolder.add(this, "poofInitialOffset").min(1).max(10).step(0.5).name("Poof Initial Offset");
            this.#guiFolder.add(this, "poofOpacity").min(0).max(1).step(0.1).name("Poof Opacity");
            this.#guiFolder.add(this, "shouldRotatePlanet").name("Rotate Planet");
        }
    }

    async #init(): Promise<void> {
        await this.#loadAssets();
        this.#adjustRotation();
        this.#addGrass();
        // this.#toonify();
        this.#addTrainPoofs();
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

                    // model.traverse((child) => {
                    // if ((child as Mesh).isMesh) {
                    //     const mesh = child as Mesh;
                    //     // TODO evaluate this - not sure about it
                    //     mesh.castShadow = true;
                    //     mesh.receiveShadow = true;
                    // }
                    // });

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

        // Initial Model Rotation
        this.model.rotation.x = 0;
        this.model.rotation.y = 3.5;
        this.model.rotation.z = 0.7;

        // GUI Tweaks
        if (this.#guiFolder) {
            this.#guiFolder
                .add(this.model.rotation, "x")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Planet Rotation X");
            this.#guiFolder
                .add(this.model.rotation, "y")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Planet Rotation Y");
            this.#guiFolder
                .add(this.model.rotation, "z")
                .min(0)
                .max(Math.PI * 2)
                .step(0.01)
                .name("Planet Rotation Z");
        }
    }

    #addGrass() {
        // TODO implement
        // add grass to "World" mesh with alpha textures
        // make sway in wind
    }

    // @ts-expect-error dev testing
    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: dev testing
    #toonify() {
        this.model?.traverse((child) => {
            if ((child as Mesh).isMesh) {
                const mesh = child as Mesh;
                if (mesh.material instanceof MeshStandardMaterial) {
                    mesh.material = new MeshToonMaterial({ color: mesh.material.color });
                }
            }
        });
    }

    #addTrainPoofs() {
        if (!this.model) return;

        this.#smokestack = this.model.getObjectByName("Plane001_1") ?? null;
        if (!this.#smokestack) {
            console.warn("Smokestack mesh not found");
        }
    }

    #spawnTrainPoof() {
        if (!this.#smokestack) return;

        const poofGeometry = new IcosahedronGeometry(1, 2);
        const poofMaterial = new MeshStandardMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: this.poofOpacity,
        });

        const poof = new Mesh<IcosahedronGeometry, MeshStandardMaterial>(poofGeometry, poofMaterial);
        const stackPos = new Vector3();
        this.#smokestack.getWorldPosition(stackPos);
        poof.position.copy(stackPos);
        poof.scale.setScalar(0.1);

        const worldObject = getScene().getObjectByName("World") ?? this.model;
        const worldCenter = new Vector3();
        if (worldObject) {
            worldObject.getWorldPosition(worldCenter);
        }

        const outward = stackPos.clone().sub(worldCenter);
        const direction = outward.setY(Math.max(stackPos.y - worldCenter.y, 0.3)).normalize();
        poof.position.addScaledVector(direction, this.poofInitialOffset);

        const velocity = direction.multiplyScalar(this.poofSpeed);

        getScene().add(poof);
        this.#poofs.push({ mesh: poof, age: 0, velocity });
    }

    #updateTrainPoofs(deltaTime: number) {
        this.poofSpawnAccumulator += deltaTime;
        if (this.poofSpawnAccumulator >= this.poofSpawnInterval) {
            this.poofSpawnAccumulator -= this.poofSpawnInterval;
            this.#spawnTrainPoof();
        }

        const scene = getScene();
        const remainingPoofs: Array<{
            mesh: Mesh<IcosahedronGeometry, MeshStandardMaterial>;
            age: number;
            velocity: Vector3;
        }> = [];

        for (const poofState of this.#poofs) {
            poofState.age += deltaTime;
            const progress = Math.min(poofState.age / this.poofLifetime, 1);

            poofState.mesh.position.addScaledVector(poofState.velocity, deltaTime);
            const scale = 1 + 0.5 * progress;
            poofState.mesh.scale.setScalar(scale);
            if (poofState.mesh.material instanceof MeshStandardMaterial) {
                poofState.mesh.material.opacity = this.poofOpacity * (1 - progress);
            }

            if (progress < 1) {
                remainingPoofs.push(poofState);
            } else {
                scene.remove(poofState.mesh);
                poofState.mesh.geometry.dispose();
                if (poofState.mesh.material instanceof MeshStandardMaterial) {
                    poofState.mesh.material.dispose();
                }
            }
        }

        this.#poofs = remainingPoofs;
    }

    animate(deltaTime: number) {
        if (this.#mixer) {
            this.#mixer.update(deltaTime * 0.75);
        }
        if (this.model && this.shouldRotatePlanet) {
            this.model.rotation.y += deltaTime * 0.1;
        }
        this.#updateTrainPoofs(deltaTime);
    }

    toggleDirection() {
        // TODO implement
        // use gsap to change train's animation direction (reverse or forward)
        // TODO tinker with timing functions for nice slow down and dir change
    }
}
