import { Hop } from "./bh/coordinates";
import { extractHop } from "./bh/hopextractor";
import { blackHoleData } from "./blackholedata";

const hops = blackHoleData.map(data => extractHop(data));

console.log("region,axial_dist,radial_dist,dist");
hops
  .filter(hop => hop.blackhole.coords.dist * 400 < 800000)
  .filter(hop => {
    const d = hop.blackhole.coords.dist - hop.exit.coords.dist;
    return d > 0;
  })
  .filter(hop => {
    return hop.galaxy === "01 Euclid";
  })
  .forEach(hop => {
    console.log(
      `${hop.blackhole.region},${hop.axialDist},${400 *
        hop.blackhole.coords.dist},${400 *
        (hop.blackhole.coords.dist - hop.exit.coords.dist)}`
    );
  });
