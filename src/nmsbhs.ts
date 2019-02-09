import commander from "commander";
import { List } from "immutable";
import { coordinates, Coordinates, Platform } from "./bh/coordinates";
import { RouteCalculator } from "./bh/routecalculator";
import { TripAdvisor } from "./bh/tripadvisor";
import { validHops } from "./bh/utils";

interface IRouteOptions {
  start: Coordinates[];
  destination: Coordinates;
}

const platform = Platform.PS4;
const galaxy = "01 Euclid";

const allHops = validHops()
  .filter(hop => hop.platform === platform)
  .filter(hop => hop.galaxy === galaxy);

commander
  .command("route")
  .option("-s, --start <items>", "start coordinates", args =>
    args.split(",").map(coordinates)
  )
  .option("-d, --destination [value]", "destination coordinates", coordinates)
  .action((options: IRouteOptions) => {
    const best: TripAdvisor = List(options.start)
      .map((start, index) => {
        return new TripAdvisor(
          new RouteCalculator(allHops),
          { label: `START[${index + 1}]`, coords: start },
          { label: "DESTINATION", coords: options.destination }
        );
      })
      .minBy(ta => {
        return ta.route().score;
      })!;

    best.explain();
  });

commander.parse(process.argv);
