import { Coordinates, coordinates as systemCoords, Hop, System } from "./coordinates";

// interface ISystemIndexes {
//     idxRegion: number;
//     idxSystem: number;
//     idxCoords: number;
//     idxEconomy: number;
// }

// const idxPlatform = 0;
// const idxGalaxy = 1;

// const blackHoleIdxs: ISystemIndexes = {
//     idxCoords: 6,
//     idxEconomy: 3,
//     idxRegion: 4,
//     idxSystem: 5,
// };

// const exitIdxs: ISystemIndexes = {
//     idxCoords: 19,
//     idxEconomy: 16,
//     idxRegion: 17,
//     idxSystem: 18,
// };

// class SystemDef {
//     constructor(public readonly indexes: ISystemIndexes, public readonly row: string[]) {
//         // todo
//     }

//     public get regionName(): string {
//         return this.row[this.indexes.idxRegion].trim();
//     }

//     public get systemName(): string {
//         return this.row[this.indexes.idxSystem].trim();
//     }

//     public get coordinates(): Coordinates {
//         return systemCoords(this.row[this.indexes.idxCoords]);
//     }

//     public get system(): System {
//         return new System(this.regionName, this.systemName, this.coordinates);
//     }
// }

function isValidHop(hop: Hop): boolean {
    const movesTowardCenter = hop.blackhole.coords.dist2Center() > hop.exit.coords.dist2Center();
    const isInsideGalacticCircle = hop.blackhole.coords.dist2Center() <= 0x7ff;
    const traveledANormalDistance = hop.radialDist * 400 <= 16000;

    return movesTowardCenter && (isInsideGalacticCircle ? traveledANormalDistance : true);
}

type COORDS = string;
type REGION = string;
type SYSTEM = string;

type HOP = [COORDS, REGION, SYSTEM, COORDS, REGION, SYSTEM];


export { isValidHop, HOP, COORDS, REGION, SYSTEM };
