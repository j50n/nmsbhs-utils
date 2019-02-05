import { blackHoleData } from "../blackholedata";
import { Coordinates, Hop } from "./coordinates";
import { extractHop, isValidHop } from "./hopextractor";

function validHops(): Hop[] {
  return blackHoleData.map(extractHop).filter(isValidHop);
}

function closestByExit(target: Coordinates, hops: Hop[]): Hop[] {
  type DistTuple = [number, Hop];

  const hs: DistTuple[] = hops.map(
    h => [target.dist2(h.exit.coords), h] as DistTuple
  );

  return hs.sort((a, b) => a[0] - b[0]).map(a => a[1]);
}

export { validHops, closestByExit };
