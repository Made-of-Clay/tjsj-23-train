export class Game {
    grid: number[][];
    targetTime: number = 0;
    currentTime: number = 0;
    hasUpgrades = false;
    selectedTile: number | null = null;

    constructor() {
        this.grid = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ];
    }

    setTile(columnIdx: number, rowIdx: number, tile: number) {
        this.grid[rowIdx][columnIdx] = tile;
        this.hasUpgrades = true;
    }

    tick() {
        // TODO: implement game logic here
        // what goes in the game tick?
        // all games have start/end stations
        // player clicks tile tray to select tile, then clicks on grid to place tile
        // placing a tile ++ currentTime by tile.timeCost
        // Show currentTime and targetTime on the UI with black letters when under, green when currentTime === targetTime
        // and red when currentTime > targetTime.
        // Tile tray has options for player to place. (TODO create TileTray class to manage this)
        //
    }
}

// TODO move to another file
// tile tray shows tiles
// click tile in tray and click spot on board/grid to place tile
// continue highlighting/outlining selected tile and showing UI tools for remove/rotate/move
// clicking off selected either selects another tile or deselects if is default tile (0 / empty) or off-grid
// each tile has time cost
// tile graphics are either empty (grass?), vertical track (N to S), horizontal track (E to W), or curved track (NE, NW, SE, SW)
// tile graphics for stations (start/end) are grass w/ building and train track on one NWSW side
// once a track is complete from start/end, should it glow or draw a line in the track with green (good) or red (bad)?
// vertical/horizontal track are same instanced tile but rotated; tile "id" treats as different but graphic is same dup instance
// curved track is same instanced tile but rotated; tile "id" treats as different but graphic is same dup instance
// Code treats them as different tiles but they are the same tile with different rotation; this allows for easier
// tile placement and rotation logic, but requires more tile instances in the tile tray.
// Tray shows small number (badge UI element) of how many of each tile the player has available to place; placing a tile
// decrements the count; if count is 0, tile is grayed out and cannot be selected until player has more of that tile (TODO
// implement logic for how player gets more tiles).

export class TileTray {}
