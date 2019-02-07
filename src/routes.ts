import { coordinates, Coordinates, Hop, Platform } from "./bh/coordinates";
import { validHops } from "./bh/utils";
import { RouteCalculator, IRoute } from "./bh/routecalculator";
import { List } from "immutable";
import util from "util";

const POINewLennon = coordinates("042F:0079:0D55:006A");
const POILuberndPloygi = coordinates("0AD5:007C:03AB:0065");
const POIHusker = coordinates("0872:007C:0108:01F1");
const POIHermitsHome = coordinates("0164:007E:0596:0021");
const POIHermitsLostDiplos = coordinates("0163:007E:0595:01DE");
const POIGekShrine700K = coordinates("0B39:007C:01FD:0079");
const POIVykeenShrine800K = coordinates("0DCD:0082:0D18:0010");
const POIHermitsHaulersAndTanSquid = coordinates("0164:007F:0596:01B3");
const POIHermitsHaulers = coordinates("0164:007E:0596:007A");
const POIHermitsHaulersAtTheHub = coordinates("042F:0078:0D55:003C");
const POIHermitsBigBoyBase = coordinates("0476:0080:0D42:01EB");
const POIGlitchingMoonMine = coordinates("00A2:0080:0550:00FD");
const POIExplorers = coordinates("0165:007E:0595:010F");

const platform = Platform.PS4;
const galaxy = "01 Euclid";

const allHops = validHops()
  .filter(hop => hop.platform === platform)
  .filter(hop => hop.galaxy === galaxy);

const route = List([
  POIHermitsHome,
  POIHermitsHaulers,
  POIHermitsHaulersAndTanSquid,
  POIHermitsHaulersAtTheHub,
  POIHermitsLostDiplos,
  POIGekShrine700K,
  POIVykeenShrine800K,
  POIHermitsBigBoyBase,
  POIGlitchingMoonMine
])
  .map(start => {
    const calc = new RouteCalculator(allHops);
    const r = calc.findRoute(start, POIHusker);
    console.log(`--> ${r.score} ${r.hops.size}`);
    return r;
  })
  .minBy(r => r.score)!;

// console.error(`distance is ${POILuberndPloygi.dist2(POINewLennon) * 400} LY`);
// console.error(`jumps are ${rc.calcJumps(POILuberndPloygi, POINewLennon)}`);

// const route = rc.findRoute(POIHermitsLostDiplos, POIHusker);

// console.log(`I TRIED ${rc.routesConsidered} COMBINATIONS.`);
// console.log(`DIFFICULTY: ${route.score}`);
// console.log(util.inspect(route.hops.toArray(), { depth: 5 }));

// console.log(
//   `start at ${route.start.toString()}, ${route.start.dist * 400} LY @ ${
//     route.start.radial
//   }`
// );
// console.log(
//   `destination at ${route.destination.toString()}, ${route.destination.dist *
//     400} LY @ ${route.destination.radial}`
// );

const rc = new RouteCalculator(allHops);

if (route.hops.isEmpty()) {
  console.log(
    `The direct route is the best route. ${rc.calcExpectedJumps(
      route.start,
      route.destination
    )}`
  );
} else {
  rc.convertHopsToRoutes(route.start, route.destination, route.hops).forEach(
    (route, index) => {
      const [a, b] = route;
      console.log(
        `jump ${a.dist2(b) * 400} LY (${rc.calcExpectedJumps(
          a,
          b
        )} jumps) from ${a.toString()} to ${b.toString()}`
      );
    }
  );
}
