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

const NewLennon = { label: "New Lennon", coords: coordinates("042F:0079:0D55:006A") };
const IndiumMegaMart = { label: "Indium Mega-Mart", coords: coordinates("0643:0081:01A1:008A") };
const HermitsHome = { label: "Hermit's Home", coords: coordinates("0164:007E:0596:0021") };
const HermitsLostDiplos = { label: "Hermit's Lost Diplos", coords: coordinates("0163:007E:0595:01DE") };
const GekShrine = { label: "Gek Shrine [700K]", coords: coordinates("0B39:007C:01FD:0079") };
const VykeenShrine = { label: "Vykeen Shrine [800k]", coords: coordinates("0DCD:0082:0D18:0010") };
const PortalBase = { label: "Portal Base", coords: coordinates("0643:0081:01A1:0079") };
const NullsEnd = { label: "Null's End and Copper Mine", coords: coordinates("081F:0083:07F3:0079") };

test("DirectedEdge toString", t => {
    const g = testGraph();
    t.deepEqual(g.calculateFor(FullStack).shortestPathTo(CafeGrumpy), [FullStack, Dubliner, InsomniaCookies, CafeGrumpy], "should find shortest path");
    t.end();
});

// test("Dijkstra Multipath (Original)", t => {
//     const starts: ISystem[] = [HermitsHome, HermitsLostDiplos, GekShrine, VykeenShrine, IndiumMegaMart];

//     const dest: ISystem = NewLennon;

//     const allHops = validHops();

//     const t0 = Date.now();
//     const calc = dijkstraCalculator(allHops, 2000, "time");
//     calc.findRoute(starts, dest).forEach(rt => {
//         console.log(JSON.stringify(rt));
//     });
//     const t1 = Date.now();

//     console.log(`${t1 - t0} milliseconds`);

//     t.end();
// });

/**
 * This uses forward and backward routing to verify one another. In the simplest case,
 * where there is one start and one destination, both algorithms should return the
 * same route.
 *
 * The scores in this test are expected to break when we tweak the weights for time
 * optimized routing.
 */
test("Dijkstra Backward/Forward Comparisions", t => {
    const allHops = validHops();

    const scenarios = [
        { start: IndiumMegaMart, dest: NewLennon, score: 37, name: "general" },
        { start: PortalBase, dest: PortalBase, score: 0, name: "same system" },
        { start: PortalBase, dest: IndiumMegaMart, score: 1, name: "BH to nearby" },
        { start: IndiumMegaMart, dest: PortalBase, score: 1, name: "nearby to BH" },
        { start: VykeenShrine, dest: NullsEnd, score: 251, name: "out to center" },
        { start: NullsEnd, dest: VykeenShrine, score: 397, name: "center to out" },
    ];

    for (const { start, dest, score, name } of scenarios) {
        const backRoutes = dijkstraCalculator(allHops, 2000, "time").findRoute([start], dest);
        const forwardRoutes = dijkstraCalculator(allHops, 2000, "time").findRoutes(start, [dest]);

        const backNames = backRoutes[0].route.map(leg => leg.label);
        const forwNames = forwardRoutes[0].route.map(leg => leg.label);

        t.deepEqual(forwNames, backNames, `[${name}] routes should match by name`);

        t.equal(backRoutes.length, 1, `[${name}] there should be one backward-route`);
        t.equal(forwardRoutes.length, 1, `[${name}] there should be one forward-route`);
        t.equal(backRoutes[0].score, score, `[${name}] backward route score should be a specific, known value`);

        t.equal(forwardRoutes[0].score, backRoutes[0].score, `[${name}] best route should give same score`);
    }

    t.end();
});
