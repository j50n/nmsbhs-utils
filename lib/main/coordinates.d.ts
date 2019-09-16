interface ICoordinates {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly s: number;
}
declare class Coordinates implements ICoordinates {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly s: number;
    constructor(x: number, y: number, z: number, s: number);
    readonly system: number;
    toString(): string;
    galacticCoordinates(planet: number): string;
    dist2Center(): number;
    dist2(other: Coordinates): number;
    dist2Sq(other: Coordinates): number;
    readonly radial: number;
}
declare const reCoordInput: string;
declare function coordinates(text: string | ICoordinates): Coordinates;
declare const GalacticCenter: Coordinates;
declare enum Platform {
    PS4 = "PS4",
    PC = "PC"
}
declare class System {
    readonly region: string;
    readonly system: string;
    readonly coords: Coordinates;
    constructor(region: string, system: string, coords: Coordinates);
    readonly label: string;
}
declare class Hop {
    readonly blackhole: System;
    readonly exit: System;
    constructor(blackhole: System, exit: System);
    readonly radialDist: number;
    readonly axialDist: number;
}
export { coordinates, Coordinates, Hop, System, Platform, reCoordInput, GalacticCenter };
//# sourceMappingURL=coordinates.d.ts.map