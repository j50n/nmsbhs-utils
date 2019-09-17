import { Coordinates, Hop } from "./coordinates";
interface IEdge {
    node: number;
    weight: number;
}
declare class DijkstraShortestPathSolver {
    nodes: number;
    adjacencyList: IEdge[][];
    constructor(nodes: number);
    addEdge(fromNode: number, toNode: number, weight: number): void;
    addBidirEdge(fromNode: number, toNode: number, weight: number): void;
    setEdges(node: number, edges: IEdge[]): void;
    calculateFor(startNode: number): ShortestPaths;
}
declare class ShortestPaths {
    startNode: number;
    backtrace: number[];
    weights: number[];
    constructor(startNode: number, backtrace: number[], weights: number[]);
    shortestPathTo(endNode: number): number[];
    totalWeight(endNode: number): number;
}
interface IRoute {
    start: Coordinates;
    destination: Coordinates;
    score: number;
}
declare class Route implements IRoute {
    readonly score: number;
    readonly route: ISystem[];
    constructor(score: number, route: ISystem[]);
    readonly start: Coordinates;
    readonly destination: Coordinates;
}
declare function isSameRegion(a: Coordinates, b: Coordinates): boolean;
declare function isSameStar(a: Coordinates, b: Coordinates): boolean;
declare function isAdjacentRegion(a: Coordinates, b: Coordinates): boolean;
declare function calcExpectedJumps(maxJumpRange: number, a: Coordinates, b: Coordinates): number;
declare function dijkstraCalculator(galacticHops: Hop[], maxJumpRange: number, optimization?: string): DijkstraCalculator;
interface ISystem {
    label: string;
    coords: Coordinates;
}
declare abstract class DijkstraCalculator {
    galacticHops: Hop[];
    maxJumpRange: number;
    constructor(galacticHops: Hop[], maxJumpRange: number);
    findRoute(starts: ISystem[], destination: ISystem): Route[];
    findRoutes(start: ISystem, destinations: ISystem[]): Route[];
    abstract blackHoleWeight(): number;
    abstract sameRegionWeight(): number;
    abstract adjacentRegionWeight(): number;
    abstract waypointWeight(): number;
}
export { IEdge, ISystem, DijkstraCalculator, dijkstraCalculator, DijkstraShortestPathSolver, isSameRegion, isSameStar, isAdjacentRegion, calcExpectedJumps, Route, IRoute, };
//# sourceMappingURL=dijkstra.d.ts.map