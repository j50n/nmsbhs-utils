import test from "tape";
import { dijkstraCalculator, DijkstraShortestPathSolver, ISystem } from "../src/dijkstra";
import { coordinates } from "../src/coordinates";
import { validHops } from "./testdata";

const Starbucks = 1;
const InsomniaCookies = 2;
const CafeGrumpy = 3;
const DigInn = 4;
const FullStack = 5;
const Dubliner = 0;

function testGraph(): DijkstraShortestPathSolver {
    const g = new DijkstraShortestPathSolver(6);

    g.addBidirEdge(DigInn, FullStack, 7);
    g.addBidirEdge(DigInn, CafeGrumpy, 9);
    g.addBidirEdge(DigInn, Dubliner, 4);
    g.addBidirEdge(FullStack, Dubliner, 2);
    g.addBidirEdge(FullStack, Starbucks, 6);
    g.addBidirEdge(Dubliner, InsomniaCookies, 7);
    g.addBidirEdge(Dubliner, Starbucks, 3);
    g.addBidirEdge(Starbucks, InsomniaCookies, 6);
    g.addBidirEdge(CafeGrumpy, InsomniaCookies, 5);

    return g;
}

test("DirectedEdge toString", t => {
    const g = testGraph();
    t.deepEqual(g.calculateFor(FullStack).shortestPathTo(CafeGrumpy), [FullStack, Dubliner, InsomniaCookies, CafeGrumpy], "should find shortest path");
    t.end();
});

test("Dijkstra Multipath 1", t => {
    const starts: ISystem[] = [
        { label: "Hermit's Home", coords: coordinates("0164:007E:0596:0021") },
        { label: "Hermit's Lost Diplos", coords: coordinates("0163:007E:0595:01DE") },
        { label: "Gek Shrine [700K]", coords: coordinates("0B39:007C:01FD:0079") },
        { label: "Vykeen Shrine [800k]", coords: coordinates("0DCD:0082:0D18:0010") },
        { label: "Indium Mega-Mart", coords: coordinates("0643:0081:01A1:008A") },
    ];

    const dest: ISystem = {
        coords: coordinates("042F:0079:0D55:006A"),
        label: "New Lennon",
    };

    const allHops = validHops();

    const t0 = Date.now();
    const calc = dijkstraCalculator(allHops, 2000, "time");
    calc.findRoute(starts, dest).forEach(rt => {
        console.log(JSON.stringify(rt));
    });
    const t1 = Date.now();

    console.log(`${t1 - t0} milliseconds`);

    t.end();
});

/**
 * Verify that when given one path, the forward and backward implementations return the
 * same best route.
 */
test("Dijkstra Backward/Forward Comparision", t => {
    const allHops = validHops();

    const start = { label: "Indium Mega-Mart", coords: coordinates("0643:0081:01A1:008A") };

    const dest = {
        coords: coordinates("042F:0079:0D55:006A"),
        label: "New Lennon",
    };

    const backRoutes = dijkstraCalculator(allHops, 2000, "time").findRoute([start], dest);
    const forwardRoutes = dijkstraCalculator(allHops, 2000, "time").findRoutes(start, [dest]);

    console.error(`BACKWARD: ${backRoutes[0].score} ${backRoutes[0].route.map(leg => leg.label).join(" -> ")}`);
    console.error(`FORWARD:  ${forwardRoutes[0].score} ${forwardRoutes[0].route.map(leg => leg.label).join(" -> ")}`);

    t.equal(backRoutes.length, 1, "there should be one backward-route");
    t.equal(forwardRoutes.length, 1, "there should be one forward-route");
    t.equal(backRoutes[0].score, 37, "backward route score should be a specific, known value");

    t.equal(forwardRoutes[0].score, backRoutes[0].score, "best route should give same score");

    t.end();
});
