import test from "tape";
import { coordinates, Coordinates } from "../src/bh/coordinates";

test("coordinates parse", t => {
  t.equal(coordinates("07FF:007F:07FE:0079").x, 0x07ff, "parses x");
  t.equal(coordinates("07FF:007F:07FE:0079").y, 0x007f, "parses y");
  t.equal(coordinates("07FF:007F:07FE:0079").z, 0x07fe, "parses z");
  t.equal(coordinates("07FF:007F:07FE:0079").system, 0x0079, "parses system");

  t.end();
});

test("radial", t => {
  t.true(
    Math.abs(coordinates("0FFF:007F:0FFF:0079").radial2 - 315) < 0.1,
    "finds the correct radial"
  );

  t.end();
});

test("distance", t => {
  t.true(
    Math.abs(coordinates("0FFF:007F:0FFF:0079").dist2 - 2896.3) < 1,
    "calculates the correct distance"
  );

  t.end();
});
