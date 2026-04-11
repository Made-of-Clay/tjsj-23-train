import type { Scene } from "three";
import {
    BoxGeometry,
    BufferGeometry,
    DoubleSide,
    DynamicDrawUsage,
    EdgesGeometry,
    Float32BufferAttribute,
    InstancedMesh,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshStandardMaterial,
    Object3D,
    PlaneGeometry,
    TorusGeometry,
} from "three";
import type { GridCell } from "./GridCell.ts";
import type { TileCell, TileOrientation, TileShape } from "./TileDefinitions.ts";
import { getRotationRadians, getTileShape, TileKind } from "./TileDefinitions.ts";

const defaultTileSize = 1;

export class TileRenderer {
    #columns: number;
    #rows: number;
    #tileSize: number;
    #shapeMeshes: Map<TileShape, InstancedMesh>;
    #shapeEdges: Map<TileShape, EdgesGeometry>;
    #emptyTileEdges: EdgesGeometry;
    #emptyTileMesh!: InstancedMesh;
    #outlineGroup: Object3D;
    #outlineMaterial: LineBasicMaterial;
    #selectedOutlineMaterial: LineBasicMaterial;
    #tempObject = new Object3D();

    constructor(scene: Scene, columns = 4, rows = 4, tileSize = defaultTileSize) {
        this.#columns = columns;
        this.#rows = rows;
        this.#tileSize = tileSize;
        this.#shapeMeshes = new Map();
        this.#shapeEdges = new Map();
        this.#outlineGroup = new Object3D();
        this.#outlineMaterial = new LineBasicMaterial({ color: 0x000000, linewidth: 3, depthTest: false });
        this.#selectedOutlineMaterial = new LineBasicMaterial({ color: 0xffff00, linewidth: 4, depthTest: false });

        this.#createBoardFloor(scene);
        this.#createBoardGrid(scene);
        this.#createEmptyTiles(scene);
        this.#emptyTileEdges = new EdgesGeometry(new PlaneGeometry(this.#tileSize * 0.96, this.#tileSize * 0.96), 15);
        scene.add(this.#outlineGroup);

        this.#createShapeMesh(scene, "straight", this.#createStraightTrackGeometry(), 0xd9d9d9);
        this.#createShapeMesh(scene, "curve", this.#createCurveTrackGeometry(), 0xd9d9d9);
        this.#createShapeMesh(scene, "station", this.#createStationGeometry(), 0xf2c94c);
    }

    updateFromGrid(grid: TileCell[][], selectedCell: GridCell | null = null) {
        const shapeCount = new Map<TileShape, number>([
            ["straight", 0],
            ["curve", 0],
            ["station", 0],
        ]);

        let emptyIndex = 0;
        this.#clearOutlines();

        for (let row = 0; row < grid.length; row += 1) {
            const rowData = grid[row];
            for (let column = 0; column < rowData.length; column += 1) {
                const cell = rowData[column];
                this.#setEmptyTileTransform(emptyIndex, column, row);
                emptyIndex += 1;

                const shape = getTileShape(cell.kind);
                if (!shape) continue;

                const mesh = this.#shapeMeshes.get(shape);
                if (!mesh) continue;

                const index = shapeCount.get(shape) ?? 0;
                this.#setInstanceTransform(shape, mesh, index, column, row, cell.orientation);
                shapeCount.set(shape, index + 1);
                this.#addOutlineForTile(shape, column, row, cell.orientation);
            }
        }

        if (selectedCell) {
            const selectedCellData = grid[selectedCell.row]?.[selectedCell.column];
            if (selectedCellData) {
                const selectedShape = getTileShape(selectedCellData.kind);
                if (selectedShape) {
                    this.#addOutlineForTile(
                        selectedShape,
                        selectedCell.column,
                        selectedCell.row,
                        selectedCellData.orientation,
                        this.#selectedOutlineMaterial,
                    );
                } else if (selectedCellData.kind === TileKind.Empty) {
                    this.#addOutlineForEmptyCell(selectedCell.column, selectedCell.row, this.#selectedOutlineMaterial);
                }
            }
        }

        this.#emptyTileMesh.count = emptyIndex;
        this.#emptyTileMesh.instanceMatrix.needsUpdate = true;

        for (const [shape, mesh] of this.#shapeMeshes) {
            mesh.count = shapeCount.get(shape) ?? 0;
            mesh.instanceMatrix.needsUpdate = true;
        }
    }

    #createBoardFloor(scene: Scene) {
        const boardWidth = this.#columns * this.#tileSize;
        const boardDepth = this.#rows * this.#tileSize;
        const plane = new Mesh(
            new PlaneGeometry(boardWidth, boardDepth),
            new MeshStandardMaterial({ color: 0x4a6a33, side: DoubleSide }),
        );

        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        scene.add(plane);
    }

    #createBoardGrid(scene: Scene) {
        const halfWidth = (this.#columns * this.#tileSize) / 2;
        const halfDepth = (this.#rows * this.#tileSize) / 2;
        const positions: number[] = [];

        for (let column = 0; column <= this.#columns; column += 1) {
            const x = column * this.#tileSize - halfWidth;
            positions.push(x, 0.001, -halfDepth, x, 0.001, halfDepth);
        }

        for (let row = 0; row <= this.#rows; row += 1) {
            const z = row * this.#tileSize - halfDepth;
            positions.push(-halfWidth, 0.001, z, halfWidth, 0.001, z);
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
        const grid = new LineSegments(
            geometry,
            new LineBasicMaterial({ color: 0x111111, transparent: true, opacity: 0.8 }),
        );

        scene.add(grid);
    }

    #createEmptyTiles(scene: Scene) {
        const emptyGeometry = new PlaneGeometry(this.#tileSize * 0.96, this.#tileSize * 0.96);
        const emptyMaterial = new MeshStandardMaterial({ color: 0x5b7b45, roughness: 0.85, metalness: 0.05 });
        this.#emptyTileMesh = new InstancedMesh(emptyGeometry, emptyMaterial, this.#columns * this.#rows);
        this.#emptyTileMesh.instanceMatrix.setUsage(DynamicDrawUsage);
        this.#emptyTileMesh.count = this.#columns * this.#rows;
        this.#emptyTileMesh.matrixAutoUpdate = false;
        scene.add(this.#emptyTileMesh);
    }

    #setEmptyTileTransform(index: number, column: number, row: number) {
        const halfWidth = (this.#columns * this.#tileSize) / 2;
        const halfDepth = (this.#rows * this.#tileSize) / 2;

        this.#tempObject.position.set(
            column * this.#tileSize - halfWidth + this.#tileSize / 2,
            0.001,
            row * this.#tileSize - halfDepth + this.#tileSize / 2,
        );
        this.#tempObject.rotation.set(-Math.PI / 2, 0, 0);
        this.#tempObject.updateMatrix();
        this.#emptyTileMesh.setMatrixAt(index, this.#tempObject.matrix);
    }

    #clearOutlines() {
        while (this.#outlineGroup.children.length > 0) {
            const child = this.#outlineGroup.children[0];
            this.#outlineGroup.remove(child);
        }
    }

    #addOutlineForTile(
        shape: TileShape,
        column: number,
        row: number,
        orientation: TileOrientation,
        material: LineBasicMaterial = this.#outlineMaterial,
    ) {
        const edges = this.#shapeEdges.get(shape);
        if (!edges) return;

        const outline = new LineSegments(edges, material);
        const halfWidth = (this.#columns * this.#tileSize) / 2;
        const halfDepth = (this.#rows * this.#tileSize) / 2;

        const xRotation = shape === "curve" ? -Math.PI / 2 : 0;
        const yRotation = shape === "curve" ? 0 : getRotationRadians(orientation);
        const zRotation = shape === "curve" ? getRotationRadians(orientation) : 0;
        outline.rotation.set(xRotation, yRotation, zRotation);
        outline.position.set(
            column * this.#tileSize - halfWidth + this.#tileSize / 2,
            0.045,
            row * this.#tileSize - halfDepth + this.#tileSize / 2,
        );
        outline.renderOrder = 999;
        outline.material.depthTest = false;
        this.#outlineGroup.add(outline);
    }

    #addOutlineForEmptyCell(column: number, row: number, material: LineBasicMaterial = this.#outlineMaterial) {
        const outline = new LineSegments(this.#emptyTileEdges, material);
        const halfWidth = (this.#columns * this.#tileSize) / 2;
        const halfDepth = (this.#rows * this.#tileSize) / 2;

        outline.rotation.set(-Math.PI / 2, 0, 0);
        outline.position.set(
            column * this.#tileSize - halfWidth + this.#tileSize / 2,
            0.01,
            row * this.#tileSize - halfDepth + this.#tileSize / 2,
        );
        outline.renderOrder = 999; // TODO learn more about this
        outline.material.depthTest = false;
        this.#outlineGroup.add(outline);
    }

    #createShapeMesh(scene: Scene, shape: TileShape, geometry: BufferGeometry, color: number) {
        const material = new MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1 });
        const maxInstances = this.#columns * this.#rows;
        const mesh = new InstancedMesh(geometry, material, maxInstances);
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.count = 0;
        mesh.matrixAutoUpdate = false;
        scene.add(mesh);
        this.#shapeMeshes.set(shape, mesh);
        this.#shapeEdges.set(shape, new EdgesGeometry(geometry, 15));
    }

    #createStraightTrackGeometry() {
        return new BoxGeometry(this.#tileSize * 0.2, 0.04, this.#tileSize * 0.8);
    }

    #createCurveTrackGeometry() {
        return new TorusGeometry(this.#tileSize * 0.35, 0.1, 8, 32, Math.PI / 2);
    }

    #createStationGeometry() {
        return new BoxGeometry(this.#tileSize * 0.8, 0.06, this.#tileSize * 0.8);
    }

    #setInstanceTransform(
        shape: TileShape,
        mesh: InstancedMesh,
        index: number,
        column: number,
        row: number,
        orientation: TileOrientation,
    ) {
        const halfWidth = (this.#columns * this.#tileSize) / 2;
        const halfDepth = (this.#rows * this.#tileSize) / 2;

        this.#tempObject.position.set(
            column * this.#tileSize - halfWidth + this.#tileSize / 2,
            0.02,
            row * this.#tileSize - halfDepth + this.#tileSize / 2,
        );

        const xRotation = shape === "curve" ? -Math.PI / 2 : 0;
        const yRotation = shape === "curve" ? 0 : getRotationRadians(orientation);
        const zRotation = shape === "curve" ? getRotationRadians(orientation) : 0;
        this.#tempObject.rotation.set(xRotation, yRotation, zRotation);
        this.#tempObject.updateMatrix();
        mesh.setMatrixAt(index, this.#tempObject.matrix);
    }
}
