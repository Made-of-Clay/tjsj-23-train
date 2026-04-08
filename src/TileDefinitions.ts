export enum TileKind {
    Empty = 0,
    Straight = 1,
    Curve = 2,
    Station = 3,
}

export enum TileOrientation {
    North = 0,
    East = 1,
    South = 2,
    West = 3,
}

export type TileShape = "straight" | "curve" | "station";

export interface TileDefinition {
    kind: TileKind;
    name: string;
    shape: TileShape | null;
    timeCost: number;
    canRotate: boolean;
    color: number;
}

export interface TileCell {
    kind: TileKind;
    orientation: TileOrientation;
}

export const DEFAULT_TILE_CELL: TileCell = {
    kind: TileKind.Empty,
    orientation: TileOrientation.North,
};

export const TILE_DEFINITIONS: { [kind in TileKind]: TileDefinition } = {
    [TileKind.Empty]: {
        kind: TileKind.Empty,
        name: "Empty",
        shape: null,
        timeCost: 0,
        canRotate: false,
        color: 0x4a6a33,
    },
    [TileKind.Straight]: {
        kind: TileKind.Straight,
        name: "Straight Track",
        shape: "straight",
        timeCost: 1,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.Curve]: {
        kind: TileKind.Curve,
        name: "Curved Track",
        shape: "curve",
        timeCost: 2,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.Station]: {
        kind: TileKind.Station,
        name: "Station",
        shape: "station",
        timeCost: 3,
        canRotate: true,
        color: 0xf2c94c,
    },
};

export function getTileDefinition(kind: TileKind): TileDefinition {
    return TILE_DEFINITIONS[kind];
}

export function getTileShape(kind: TileKind): TileShape | null {
    return TILE_DEFINITIONS[kind].shape;
}

export function normalizeOrientation(value: number): TileOrientation {
    const normalized = ((value % 4) + 4) % 4;
    return normalized as TileOrientation;
}

export function getRotationRadians(orientation: TileOrientation): number {
    return orientation * (Math.PI / 2);
}
