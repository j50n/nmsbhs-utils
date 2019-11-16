import TinyQueue from "tinyqueue";
import { Coordinates, Hop, GalacticCenter } from "./coordinates";
import { segmentIntersectsSphere } from "./intersection";

interface IEdge {
    node: number;
    weight: number;
}

interface IPath {
    node: number;
    weight: number;
}

/**
 * Implementation of Dijkstra's Shortest Path algorithm.
 *
 * Nodes are numbered from 0 to n-1.
 *
 * Adapted from https://medium.com/@adriennetjohnson/a-walkthrough-of-dijkstras-algorithm-in-javascript-e94b74192026
 * This has been made more lightweight by treating nodes as an index rather than a string (name). We use `tinyqueue`
 * as our priority queue. All map-likes have been eliminated, but there are still object references in here, so
 * not as fast as possible, but should be fast enough and not too heavy on memory.
 */
class DijkstraShortestPathSolver {
    public adjacencyList: IEdge[][];

    constructor(public nodes: number) {
        this.adjacencyList = new Array(nodes).fill(null).map(v => new Array(0));
    }

    public addEdge(fromNode: number, toNode: number, weight: number): void {
        if (weight < 0) {
            throw new RangeError("weight must be >= 0");
        }
        this.adjacencyList[fromNode].push({ node: toNode, weight });
    }

    public addBidirEdge(fromNode: number, toNode: number, weight: number): void {
        if (weight < 0) {
            throw new RangeError("weight must be >= 0");
        }
        this.adjacencyList[fromNode].push({ node: toNode, weight });
        this.adjacencyList[toNode].push({ node: fromNode, weight });
    }

    public setEdges(node: number, edges: IEdge[]): void {
        this.adjacencyList[node] = edges;
    }

    /**
     * Calculate shortest paths for all nodes for the given start node.
     * @param startNode The start node.
     */
    public calculateFor(startNode: number): ShortestPaths {
        const weights: number[] = new Array(this.nodes).fill(Infinity);
        weights[startNode] = 0;

        const pq = new TinyQueue<IPath>([{ node: startNode, weight: 0 }], (a, b) => a.weight - b.weight);

        const backtrace: number[] = new Array(this.nodes).fill(-1);

        while (pq.length !== 0) {
            const shortestStep = pq.pop();
            const currentNode = shortestStep!.node;

            this.adjacencyList[currentNode].forEach(neighbor => {
                const weight = weights[currentNode] + neighbor.weight;

                if (weight < weights[neighbor.node]) {
                    weights[neighbor.node] = weight;
                    backtrace[neighbor.node] = currentNode;
                    pq.push({ node: neighbor.node, weight });
                }
            });
        }

        return new ShortestPaths(startNode, backtrace, weights);
    }
}

class ShortestPaths {
    constructor(public startNode: number, public backtrace: number[], public weights: number[]) {}

    /**
     * Find the shortest path to the given end node.
     * @param endNode The end node.
     */
    public shortestPathTo(endNode: number): number[] {
        const path = [endNode];
        let lastStep = endNode;

        while (lastStep !== this.startNode) {
            path.unshift(this.backtrace[lastStep]);
            lastStep = this.backtrace[lastStep];
        }

        return path;
    }

    /**
     * Total weight of the path from the start node to the given end node.
     * @param endNode The end node.
     */
    public totalWeight(endNode: number): number {
        return this.weights[endNode];
    }
}

interface IRoute {
    start: Coordinates;
    destination: Coordinates;
    score: number;
}

class Route implements IRoute {
    constructor(public readonly score: number, public readonly route: ISystem[]) {}

    public get start(): Coordinates {
        return this.route[0].coords;
    }

    public get destination(): Coordinates {
        return this.route[this.route.length - 1].coords;
    }
}

function isSameRegion(a: Coordinates, b: Coordinates): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}

function isSameStar(a: Coordinates, b: Coordinates): boolean {
    return isSameRegion(a, b) && a.system === b.system;
}

function isAdjacentRegion(a: Coordinates, b: Coordinates): boolean {
    return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.z - b.z) <= 1;
}

/**
 * Number of jumps to get from point A to point B.
 * @param a First point.
 * @param b Second point.
 * @returns Integral number of jumps, rounded up.
 */
function calcExpectedJumps(maxJumpRange: number, a: Coordinates, b: Coordinates): number {
    const result = Math.ceil((a.dist2(b) * 400) / maxJumpRange);

    if (result === 0) {
        if (isSameStar(a, b)) {
            return 0;
        } else {
            return 1;
        }
    } else {
        return result;
    }
}

function dijkstraCalculator(galacticHops: Hop[], maxJumpRange: number, optimization: string = "fuel"): DijkstraCalculator {
    if (optimization === "fuel") {
        return new DijkstraCalculator4Fuel(galacticHops, maxJumpRange);
    } else if (optimization === "time") {
        return new DijkstraCalculator4Time(galacticHops, maxJumpRange);
    } else {
        throw new Error(`unknown optimization value: ${optimization}`);
    }
}

interface ISystem {
    label: string;
    coords: Coordinates;
}

interface ISystemIndex {
    system: ISystem;
    index: number;
    edges: IEdge[];
}

/**
 * Calculate shortest paths using Dijkstra's shortest path algorithm.
 */
abstract class DijkstraCalculator {
    constructor(public galacticHops: Hop[], public maxJumpRange: number) {}

    /**
     * This finds the shortest route from each start to the destination and returns
     * all routes, scored. Generally you want to pick the lowest scored route to travel.
     *
     * @param starts The list of starts.
     * @param destination The destination.
     */
    public findRoute(starts: ISystem[], destination: ISystem): Route[] {
        return new BackwardRouteFinder(this).findRoute(starts, destination);
    }

    /**
     * This finds the shortest route from the start to each destination, scored.
     *
     * @param start The start.
     * @param destinations The list of destinations.
     */
    public findRoutes(start: ISystem, destinations: ISystem[]): Route[] {
        return new ForwardRouteFinder(this).findRoutes(start, destinations);
    }

    public abstract blackHoleWeight(): number;

    public abstract sameRegionWeight(): number;

    public abstract adjacentRegionWeight(): number;

    public abstract waypointWeight(): number;
}

/**
 * Route-finder common stuff.
 */
abstract class AbstractRouteFinder {
    constructor(public calculator: DijkstraCalculator) {}

    protected get galacticHops(): Hop[] {
        return this.calculator.galacticHops;
    }

    protected blackHoleWeight(): number {
        return this.calculator.blackHoleWeight();
    }

    protected sameRegionWeight(): number {
        return this.calculator.sameRegionWeight();
    }

    protected adjacentRegionWeight(): number {
        return this.calculator.adjacentRegionWeight();
    }

    protected waypointWeight(): number {
        return this.calculator.waypointWeight();
    }

    protected maxJumpRange(): number {
        return this.calculator.maxJumpRange;
    }

    /**
     * Index systems by their `x` coordinate.
     *
     * This is a simple way to index by position so I can find [closest()]
     * systems faster.
     *
     * @param systems Original, unindexed systems.
     */
    protected systemsByX(systems: ISystemIndex[]): ISystemIndex[][] {
        const result: ISystemIndex[][] = [];
        for (let i = 0; i <= 0xfff; i++) {
            result.push([]);
        }
        for (const system of systems) {
            result[system.system.coords.x].push(system);
        }
        return result;
    }

    /**
     * Find the closest systems to the given system.
     * @param target Target system.
     * @param systemsByX Systems pre-indexed by `x` value.
     */
    protected closest(target: Coordinates, systemsByX: ISystemIndex[][]): ISystemIndex[] {
        const MinCount = 20;
        const MaxCount = 150;

        let range = 50000 / 400;
        let retries = 0;

        let syss = [];
        do {
            const sysarrs: ISystemIndex[][] = [];
            for (let i = Math.max(target.x - range, 0); i <= Math.min(target.x + range, 0xfff); i++) {
                sysarrs.push(systemsByX[i].filter(s => Math.abs(target.z - s.system.coords.z) <= range));
            }

            const systems: ISystemIndex[] = ([] as ISystemIndex[]).concat(...sysarrs);

            syss = systems
                .filter(s => !segmentIntersectsSphere(s.system.coords, target, GalacticCenter, 7))
                .map(s => {
                    return {
                        system: s,
                        dist: target.dist2Sq(s.system.coords),
                    };
                });

            range *= 2;
            retries += 1;
        } while (retries < 3 && syss.length < MinCount);

        return syss
            .sort((a, b) => a.dist - b.dist)
            .map(a => a.system)
            .slice(0, MaxCount);
    }

    protected routeWeight(a: Coordinates, b: Coordinates): number {
        if (isSameStar(a, b)) {
            return 0;
        } else if (isSameRegion(a, b)) {
            return this.sameRegionWeight() + 0.0000001;
        } else if (isAdjacentRegion(a, b)) {
            return Math.max(this.adjacentRegionWeight(), calcExpectedJumps(this.maxJumpRange(), a, b)) + 0.00001;
        } else {
            return this.waypointWeight() + calcExpectedJumps(this.maxJumpRange(), a, b) + 0.001;
        }
    }

    protected giveNodesMinimumWeight(nodes: ISystemIndex[]): void {
        for (const [i, node] of nodes.entries()) {
            node.index = i;

            /*
             * Edges have minimal non-zero weight.
             * This prevents ties between shorter and longer paths when edge weights can be 0.
             */
            node.edges.forEach(e => {
                if (e.weight === 0) {
                    e.weight += 0.000000001;
                }
            });
        }
    }
}

/**
 * Find routes forward so that you have one start and a bunch of destinations
 * to choose from.
 */
class ForwardRouteFinder extends AbstractRouteFinder {
    constructor(public calculator: DijkstraCalculator) {
        super(calculator);
    }

    public findRoutes(start: ISystem, destinations: ISystem[]): Route[] {
        /* All nodes; this is the indexed array. */
        const nodes: ISystemIndex[] = [];

        /* Just the black holes. */
        const bhs: ISystemIndex[] = [];
        /* Just the exits. */
        const exits: ISystemIndex[] = [];
        /* Destination/bases. */
        const dts: ISystemIndex[] = [];

        /* Destination. */
        const startSystem: ISystemIndex = { index: -1, system: start, edges: [] };

        nodes.push(startSystem);

        for (const destination of destinations) {
            const dt = { index: -1, system: destination, edges: [] };
            nodes.push(dt);
            dts.push(dt);
        }

        for (const hop of this.galacticHops) {
            const ex = { index: -1, system: hop.exit, edges: [] };
            nodes.push(ex);
            exits.push(ex);
            const exIndex = nodes.length - 1;

            const bh = { index: nodes.length, system: hop.blackhole, edges: [{ node: exIndex, weight: this.blackHoleWeight() }] };
            nodes.push(bh);
            bhs.push(bh);

            startSystem.edges.push({ node: bh.index, weight: this.routeWeight(bh.system.coords, startSystem.system.coords) });
        }

        this.giveNodesMinimumWeight(nodes);

        const bhsByX = this.systemsByX(bhs);
        for (const exit of exits) {
            const bhEdges = this.closest(exit.system.coords, bhsByX).map(bh => {
                return { node: bh.index, weight: this.routeWeight(exit.system.coords, bh.system.coords) };
            });

            exit.edges = bhEdges;
        }

        for (const exit of exits) {
            for (const dest of dts) {
                if (!segmentIntersectsSphere(exit.system.coords, dest.system.coords, GalacticCenter, 7)) {
                    exit.edges.push({ node: dest.index, weight: this.routeWeight(dest.system.coords, exit.system.coords) });
                }
            }
        }

        for (const dt of dts) {
            startSystem.edges.push({ node: dt.index, weight: this.routeWeight(startSystem.system.coords, dt.system.coords) });
        }

        const g = new DijkstraShortestPathSolver(nodes.length);
        for (const node of nodes) {
            g.setEdges(node.index, node.edges);
        }

        const shortest: ShortestPaths = g.calculateFor(startSystem.index);

        return dts.map(st => {
            const score = Math.round(shortest.totalWeight(st.index));

            const route = shortest
                .shortestPathTo(st.index)
                .map(node => nodes[node])
                .map(node => node.system);

            return new Route(score, route);
        });
    }
}

/**
 * Find route backwards (original way) so that you have multiple start
 * locations and one destination.
 */
class BackwardRouteFinder extends AbstractRouteFinder {
    constructor(public calculator: DijkstraCalculator) {
        super(calculator);
    }

    public findRoute(starts: ISystem[], destination: ISystem): Route[] {
        /* All nodes; this is the indexed array. */
        const nodes: ISystemIndex[] = [];

        /* Just the black holes. */
        const bhs: ISystemIndex[] = [];
        /* Just the exits. */
        const exits: ISystemIndex[] = [];
        /* Starts/bases. */
        const sts: ISystemIndex[] = [];

        /* Destination. */
        const dest: ISystemIndex = { index: -1, system: destination, edges: [] };

        nodes.push(dest);

        for (const start of starts) {
            const st = { index: -1, system: start, edges: [] };
            nodes.push(st);
            sts.push(st);
        }

        for (const hop of this.galacticHops) {
            const bh = { index: -1, system: hop.blackhole, edges: [] };
            nodes.push(bh);
            bhs.push(bh);
            const bhIndex = nodes.length - 1;

            const ex = { index: -1, system: hop.exit, edges: [{ node: bhIndex, weight: this.blackHoleWeight() }] };
            nodes.push(ex);
            exits.push(ex);
        }

        this.giveNodesMinimumWeight(nodes);

        const exitsByX = this.systemsByX(exits);
        for (const bh of bhs) {
            const exitEdges = this.closest(bh.system.coords, exitsByX).map(s => {
                return { node: s.index, weight: this.routeWeight(bh.system.coords, s.system.coords) };
            });

            const stEdges = sts
                .filter(s => !segmentIntersectsSphere(s.system.coords, bh.system.coords, GalacticCenter, 7))
                .map(s => {
                    return { node: s.index, weight: this.routeWeight(bh.system.coords, s.system.coords) };
                });

            bh.edges = exitEdges.concat(stEdges);
        }

        /* Intentional. Edges for starts to dest may pass through center. Avoids a no-answer scenario. */
        dest.edges = exits
            .filter(s => !segmentIntersectsSphere(s.system.coords, dest.system.coords, GalacticCenter, 7))
            .concat(sts)
            .map(s => {
                return { node: s.index, weight: this.routeWeight(dest.system.coords, s.system.coords) };
            });

        const g = new DijkstraShortestPathSolver(nodes.length);
        for (const node of nodes) {
            g.setEdges(node.index, node.edges);
        }

        const shortest: ShortestPaths = g.calculateFor(dest.index);

        return sts.map(st => {
            const score = Math.round(shortest.totalWeight(st.index));

            const route = shortest
                .shortestPathTo(st.index)
                .map(node => nodes[node])
                .map(node => node.system)
                .reverse();

            return new Route(score, route);
        });
    }
}

class DijkstraCalculator4Time extends DijkstraCalculator {
    constructor(public galacticHops: Hop[], public maxJumpRange: number) {
        super(galacticHops, maxJumpRange);
    }

    public blackHoleWeight(): number {
        return 1;
    }

    public sameRegionWeight(): number {
        return 1;
    }

    public adjacentRegionWeight(): number {
        return 2;
    }

    public waypointWeight(): number {
        return 4;
    }
}

class DijkstraCalculator4Fuel extends DijkstraCalculator {
    constructor(public galacticHops: Hop[], public maxJumpRange: number) {
        super(galacticHops, maxJumpRange);
    }

    public blackHoleWeight(): number {
        return 0;
    }

    public sameRegionWeight(): number {
        return 1;
    }

    public adjacentRegionWeight(): number {
        return 1;
    }

    public waypointWeight(): number {
        return 0;
    }
}

export {
    IEdge,
    ISystem,
    DijkstraCalculator,
    dijkstraCalculator,
    DijkstraShortestPathSolver,
    isSameRegion,
    isSameStar,
    isAdjacentRegion,
    calcExpectedJumps,
    Route,
    IRoute,
};
