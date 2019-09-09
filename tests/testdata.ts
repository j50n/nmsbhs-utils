import fs from "fs";
import { HOP, isValidHop } from "../src/hopextractor";
import { Hop, System, coordinates } from "../src/coordinates";

function readData(): HOP[] {
    return fs
        .readFileSync("./tests/blackholes.txt")
        .toString("utf-8")
        .split("\n")
        .map(line => JSON.parse(line) as HOP);
}

export function validHops(): Hop[] {
    return readData()
        .map(hop => new Hop(new System(hop[1], hop[2], coordinates(hop[0])), new System(hop[4], hop[5], coordinates(hop[3]))))
        .filter(hop => hop !== null)
        .map(hop => hop as Hop)
        .filter((hop: Hop) => isValidHop(hop));
}
