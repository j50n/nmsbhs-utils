"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tinyqueue_1 = __importDefault(require("tinyqueue"));
const coordinates_1 = require("./coordinates");
const intersection_1 = require("./intersection");
class DijkstraShortestPathSolver {
    constructor(nodes) {
        this.nodes = nodes;
        this.adjacencyList = new Array(nodes).fill(null).map(v => new Array(0));
    }
    addEdge(fromNode, toNode, weight) {
        if (weight < 0) {
            throw new RangeError("weight must be >= 0");
        }
        this.adjacencyList[fromNode].push({ node: toNode, weight });
    }
    addBidirEdge(fromNode, toNode, weight) {
        if (weight < 0) {
            throw new RangeError("weight must be >= 0");
        }
        this.adjacencyList[fromNode].push({ node: toNode, weight });
        this.adjacencyList[toNode].push({ node: fromNode, weight });
    }
    setEdges(node, edges) {
        this.adjacencyList[node] = edges;
    }
    calculateFor(startNode) {
        const weights = new Array(this.nodes).fill(Infinity);
        weights[startNode] = 0;
        const pq = new tinyqueue_1.default([{ node: startNode, weight: 0 }], (a, b) => a.weight - b.weight);
        const backtrace = new Array(this.nodes).fill(-1);
        while (pq.length !== 0) {
            const shortestStep = pq.pop();
            const currentNode = shortestStep.node;
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
exports.DijkstraShortestPathSolver = DijkstraShortestPathSolver;
class ShortestPaths {
    constructor(startNode, backtrace, weights) {
        this.startNode = startNode;
        this.backtrace = backtrace;
        this.weights = weights;
    }
    shortestPathTo(endNode) {
        const path = [endNode];
        let lastStep = endNode;
        while (lastStep !== this.startNode) {
            path.unshift(this.backtrace[lastStep]);
            lastStep = this.backtrace[lastStep];
        }
        return path;
    }
    totalWeight(endNode) {
        return this.weights[endNode];
    }
}
class Route {
    constructor(score, route) {
        this.score = score;
        this.route = route;
    }
    get start() {
        return this.route[0].coords;
    }
    get destination() {
        return this.route[this.route.length - 1].coords;
    }
}
exports.Route = Route;
function isSameRegion(a, b) {
    return a.x === b.x && a.y === b.y && a.z === b.z;
}
exports.isSameRegion = isSameRegion;
function isSameStar(a, b) {
    return isSameRegion(a, b) && a.system === b.system;
}
exports.isSameStar = isSameStar;
function isAdjacentRegion(a, b) {
    return Math.abs(a.x - b.x) <= 1 && Math.abs(a.y - b.y) <= 1 && Math.abs(a.z - b.z) <= 1;
}
exports.isAdjacentRegion = isAdjacentRegion;
function calcExpectedJumps(maxJumpRange, a, b) {
    const result = Math.ceil((a.dist2(b) * 400) / maxJumpRange);
    if (result === 0) {
        if (isSameStar(a, b)) {
            return 0;
        }
        else {
            return 1;
        }
    }
    else {
        return result;
    }
}
exports.calcExpectedJumps = calcExpectedJumps;
function dijkstraCalculator(galacticHops, maxJumpRange, optimization = "fuel") {
    if (optimization === "fuel") {
        return new DijkstraCalculator4Fuel(galacticHops, maxJumpRange);
    }
    else if (optimization === "time") {
        return new DijkstraCalculator4Time(galacticHops, maxJumpRange);
    }
    else {
        throw new Error(`unknown optimization value: ${optimization}`);
    }
}
exports.dijkstraCalculator = dijkstraCalculator;
class DijkstraCalculator {
    constructor(galacticHops, maxJumpRange) {
        this.galacticHops = galacticHops;
        this.maxJumpRange = maxJumpRange;
    }
    findRoute(starts, destination) {
        return new BackwardRouteFinder(this).findRoute(starts, destination);
    }
    findRoutes(start, destinations) {
        return new ForwardRouteFinder(this).findRoutes(start, destinations);
    }
}
exports.DijkstraCalculator = DijkstraCalculator;
class AbstractRouteFinder {
    constructor(calculator) {
        this.calculator = calculator;
    }
    get galacticHops() {
        return this.calculator.galacticHops;
    }
    blackHoleWeight() {
        return this.calculator.blackHoleWeight();
    }
    sameRegionWeight() {
        return this.calculator.sameRegionWeight();
    }
    adjacentRegionWeight() {
        return this.calculator.adjacentRegionWeight();
    }
    waypointWeight() {
        return this.calculator.waypointWeight();
    }
    maxJumpRange() {
        return this.calculator.maxJumpRange;
    }
    systemsByX(systems) {
        const result = [];
        for (let i = 0; i <= 0xfff; i++) {
            result.push([]);
        }
        for (const system of systems) {
            result[system.system.coords.x].push(system);
        }
        return result;
    }
    closest(target, systemsByX) {
        const MinCount = 15;
        const MaxCount = 30;
        let range = 50000 / 400;
        let retries = 0;
        let syss = [];
        do {
            const sysarrs = [];
            for (let i = Math.max(target.x - range, 0); i <= Math.min(target.x + range, 0xfff); i++) {
                sysarrs.push(systemsByX[i].filter(s => Math.abs(target.z - s.system.coords.z) <= range));
            }
            const systems = [].concat(...sysarrs);
            syss = systems
                .filter(s => !intersection_1.segmentIntersectsSphere(s.system.coords, target, coordinates_1.GalacticCenter, 7))
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
    routeWeight(a, b) {
        if (isSameStar(a, b)) {
            return 0;
        }
        else if (isSameRegion(a, b)) {
            return this.sameRegionWeight() + 0.0000001;
        }
        else if (isAdjacentRegion(a, b)) {
            return Math.max(this.adjacentRegionWeight(), calcExpectedJumps(this.maxJumpRange(), a, b)) + 0.00001;
        }
        else {
            return this.waypointWeight() + calcExpectedJumps(this.maxJumpRange(), a, b) + 0.001;
        }
    }
    giveNodesMinimumWeight(nodes) {
        for (const [i, node] of nodes.entries()) {
            node.index = i;
            node.edges.forEach(e => {
                if (e.weight === 0) {
                    e.weight += 0.000000001;
                }
            });
        }
    }
}
class ForwardRouteFinder extends AbstractRouteFinder {
    constructor(calculator) {
        super(calculator);
        this.calculator = calculator;
    }
    findRoutes(start, destinations) {
        const nodes = [];
        const bhs = [];
        const exits = [];
        const dts = [];
        const startSystem = { index: -1, system: start, edges: [] };
        const ta = new Date();
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
        const tb = new Date();
        console.error(`setup took ${tb.getTime() - ta.getTime()}`);
        const t1 = new Date();
        const bhsByX = this.systemsByX(bhs);
        for (const exit of exits) {
            const bhEdges = this.closest(exit.system.coords, bhsByX).map(bh => {
                return { node: bh.index, weight: this.routeWeight(exit.system.coords, bh.system.coords) };
            });
            exit.edges = bhEdges;
        }
        const t2 = new Date();
        console.error(`weights took ${t2.getTime() - t1.getTime()}`);
        const ti = new Date();
        for (const exit of exits) {
            for (const dest of dts) {
                if (!intersection_1.segmentIntersectsSphere(exit.system.coords, dest.system.coords, coordinates_1.GalacticCenter, 7)) {
                    exit.edges.push({ node: dest.index, weight: this.routeWeight(dest.system.coords, exit.system.coords) });
                }
            }
        }
        const tj = new Date();
        console.error(`dest weights took ${tj.getTime() - ti.getTime()}`);
        for (const dt of dts) {
            startSystem.edges.push({ node: dt.index, weight: this.routeWeight(startSystem.system.coords, dt.system.coords) });
        }
        const tx = new Date();
        const g = new DijkstraShortestPathSolver(nodes.length);
        for (const node of nodes) {
            g.setEdges(node.index, node.edges);
        }
        const shortest = g.calculateFor(startSystem.index);
        const ty = new Date();
        console.error(`calculation took ${ty.getTime() - tx.getTime()}`);
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
class BackwardRouteFinder extends AbstractRouteFinder {
    constructor(calculator) {
        super(calculator);
        this.calculator = calculator;
    }
    findRoute(starts, destination) {
        const nodes = [];
        const bhs = [];
        const exits = [];
        const sts = [];
        const dest = { index: -1, system: destination, edges: [] };
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
                .filter(s => !intersection_1.segmentIntersectsSphere(s.system.coords, bh.system.coords, coordinates_1.GalacticCenter, 7))
                .map(s => {
                return { node: s.index, weight: this.routeWeight(bh.system.coords, s.system.coords) };
            });
            bh.edges = exitEdges.concat(stEdges);
        }
        dest.edges = exits
            .filter(s => !intersection_1.segmentIntersectsSphere(s.system.coords, dest.system.coords, coordinates_1.GalacticCenter, 7))
            .concat(sts)
            .map(s => {
            return { node: s.index, weight: this.routeWeight(dest.system.coords, s.system.coords) };
        });
        const g = new DijkstraShortestPathSolver(nodes.length);
        for (const node of nodes) {
            g.setEdges(node.index, node.edges);
        }
        const shortest = g.calculateFor(dest.index);
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
    constructor(galacticHops, maxJumpRange) {
        super(galacticHops, maxJumpRange);
        this.galacticHops = galacticHops;
        this.maxJumpRange = maxJumpRange;
    }
    blackHoleWeight() {
        return 1;
    }
    sameRegionWeight() {
        return 1;
    }
    adjacentRegionWeight() {
        return 2;
    }
    waypointWeight() {
        return 4;
    }
}
class DijkstraCalculator4Fuel extends DijkstraCalculator {
    constructor(galacticHops, maxJumpRange) {
        super(galacticHops, maxJumpRange);
        this.galacticHops = galacticHops;
        this.maxJumpRange = maxJumpRange;
    }
    blackHoleWeight() {
        return 0;
    }
    sameRegionWeight() {
        return 1;
    }
    adjacentRegionWeight() {
        return 1;
    }
    waypointWeight() {
        return 0;
    }
}
//# sourceMappingURL=dijkstra.js.map