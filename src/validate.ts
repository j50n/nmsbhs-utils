import deepEqual = require("deep-equal");
import { Hop, System, Platform } from "./bh/coordinates";
import { extractHop, isValidHop } from "./bh/hopextractor";
import { validHops } from "./bh/utils";
import { blackHoleData } from "./blackholedata";

/*
 * Verify all data can be parsed.
 */
blackHoleData.forEach((data: string[], index: number) => {
  try {
    const hop = extractHop(data);
    // console.error(JSON.stringify(hop));
  } catch (e) {
    console.error(`Aw crud. Row ${index + 1}: ${data} - ${e}`);
    process.exit(1);
  }
});

const bhs = blackHoleData.map(data => extractHop(data));

/*
 * Check for duplicate black-holes by name.
 */

bhs.forEach((hopA: Hop, indexA: number) => {
  bhs.forEach((hopB: Hop, indexB: number) => {
    if (indexA !== indexB) {
      if (
        hopA.platform === hopB.platform &&
        hopA.blackhole.region === hopB.blackhole.region &&
        hopA.blackhole.system === hopB.blackhole.system
      ) {
        throw new Error(
          `duplicate black hole: ${
            hopA.blackhole.system
          }@[${indexA},${indexB}]\n${JSON.stringify(hopA)}\n${JSON.stringify(
            hopB
          )}`
        );
      }
    }
  });
});

class Sys {
  constructor(public system: System, public galaxy: string) {}
}

/*
 * Check for region misspellings.
 */

const systems: Sys[] = bhs
  .filter(isValidHop)
  .map(hop => [
    new Sys(hop.blackhole, hop.galaxy),
    new Sys(hop.exit, hop.galaxy)
  ])
  .reduce((acc, next) => acc.concat(next));

systems.forEach((sysA: Sys, iA: number) => {
  systems.forEach((sysB: Sys, iB: number) => {
    if (
      iA !== iB &&
      sysA.galaxy === sysB.galaxy &&
      sysA.system.coords.x === sysB.system.coords.x &&
      sysA.system.coords.y === sysB.system.coords.y &&
      sysA.system.coords.z === sysB.system.coords.z &&
      sysA.system.region !== sysB.system.region
    ) {
      console.error(
        `region mismatch: ${sysA.system.region}[${sysA.system.coords}], ${
          sysB.system.region
        }[${sysB.system.coords}]`
      );
      process.exit(1);
    }
  });
});

const euclidPs4 = validHops()
  .filter(hop => hop.platform === Platform.PS4)
  .filter(hop => hop.galaxy === "01 Euclid");

console.error(`There are ${euclidPs4.length} hops in Euclid (PS4).`);
