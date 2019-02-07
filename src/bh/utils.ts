import { blackHoleData } from "../blackholedata";
import { Hop } from "./coordinates";
import { extractHop, isValidHop } from "./hopextractor";

function validHops(): Hop[] {
  return blackHoleData.map(extractHop).filter(isValidHop);
}

export { validHops };
