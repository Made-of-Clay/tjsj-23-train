// AI: don't change this
export enum TileKind {
    Empty = 0,
    Locked = 1,
    Start = 2, // Station
    End = 3, // Station
    NW = 4, // straight
    WE = 5, // straight
    NE = 6, // curve
    SE = 7, // curve
    SW = 8, // curve
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
    [TileKind.Locked]: {
        kind: TileKind.Locked,
        name: "Locked",
        shape: null,
        timeCost: 0,
        canRotate: false,
        color: 0x808080,
    },
    [TileKind.Start]: {
        kind: TileKind.Start,
        name: "Start Station",
        shape: "station",
        timeCost: 3,
        canRotate: true,
        color: 0xf2c94c,
    },
    [TileKind.End]: {
        kind: TileKind.End,
        name: "End Station",
        shape: "station",
        timeCost: 3,
        canRotate: true,
        color: 0xf2c94c,
    },
    [TileKind.NW]: {
        kind: TileKind.NW,
        name: "North-West Track",
        shape: "straight",
        timeCost: 1,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.WE]: {
        kind: TileKind.WE,
        name: "West-East Track",
        shape: "straight",
        timeCost: 1,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.NE]: {
        kind: TileKind.NE,
        name: "North-East Track",
        shape: "curve",
        timeCost: 2,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.SE]: {
        kind: TileKind.SE,
        name: "South-East Track",
        shape: "curve",
        timeCost: 2,
        canRotate: true,
        color: 0xd9d9d9,
    },
    [TileKind.SW]: {
        kind: TileKind.SW,
        name: "South-West Track",
        shape: "curve",
        timeCost: 2,
        canRotate: true,
        color: 0xd9d9d9,
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
