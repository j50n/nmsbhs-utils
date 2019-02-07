import { List } from "immutable";
import { Coordinates, Hop } from "./coordinates";

type Route = [Coordinates, Coordinates];

interface IRoute {
  start: Coordinates;
  destination: Coordinates;
  score: number;
  hops: List<Hop>;
}

/**
 * Calculate best route using black-holes based on lowest trip difficulty.
 */
class RouteCalculator {
  protected readonly waypointPenalty = 4;

  protected readonly adjacentPenalty = 1;

  protected routesConsideredCounter = 0;

  constructor(
    public readonly galacticHops: Hop[],
    public readonly maxJumpRange = 2809,
    public readonly jumpEfficiency = 0.8
  ) {}

  public get routesConsidered(): number {
    return this.routesConsideredCounter;
  }

  public closestByExit(target: Coordinates): Hop[] {
    type DistTuple = [number, Hop];

    const hs: DistTuple[] = this.galacticHops.map(
      h => [target.dist2(h.exit.coords), h] as DistTuple
    );

    return hs.sort((a, b) => a[0] - b[0]).map(a => a[1]);
  }

  public isSameRegion(a: Coordinates, b: Coordinates): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
  }

  public isSameStar(a: Coordinates, b: Coordinates): boolean {
    return this.isSameRegion(a, b) && a.system === b.system;
  }

  public isAdjacentRegion(a: Coordinates, b: Coordinates): boolean {
    return (
      Math.abs(a.x - b.x) <= 1 &&
      Math.abs(a.y - b.y) <= 1 &&
      Math.abs(a.z - b.z) <= 1
    );
  }

  public convertHopsToRoutes(
    start: Coordinates,
    destination: Coordinates,
    hops: List<Hop>
  ): List<Route> {
    const exits = List(hops.map(hop => hop.exit.coords)).unshift(start);
    const bhs = List(hops.map(hop => hop.blackhole.coords)).push(destination);

    return exits.zip(bhs);
  }

  /**
   * Number of jumps to get from point A to point B.
   * @param a First point.
   * @param b Second point.
   * @returns Integral number of jumps, rounded up.
   */
  public calcExpectedJumps(a: Coordinates, b: Coordinates): number {
    const result = Math.ceil(
      (a.dist2(b) * 400) / (this.jumpEfficiency * this.maxJumpRange)
    );

    if (result === 0) {
      if (this.isSameStar(a, b)) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return result;
    }
  }

  public calculateScore(
    start: Coordinates,
    destination: Coordinates,
    hops: List<Hop>
  ): number {
    const scores = this.convertHopsToRoutes(start, destination, hops).map(
      jump => {
        const [a, b] = jump;
        if (this.isSameStar(a, b)) {
          return 0;
        } else if (this.isSameRegion(a, b)) {
          return 1;
        } else if (this.isAdjacentRegion(a, b)) {
          return 1 + this.adjacentPenalty;
        } else {
          return this.calcExpectedJumps(a, b) + this.waypointPenalty;
        }
      }
    );

    return scores.reduce((a, b) => a + b, 0) + hops.size;
  }

  public calculateRunningScore(
    destination: Coordinates,
    hops: List<Hop>
  ): number {
    let start: Coordinates = destination;
    if (!hops.isEmpty()) {
      start = (hops.first() as Hop).blackhole.coords;
    }

    return this.calculateScore(start, destination, hops);
  }

  public findRoute(start: Coordinates, destination: Coordinates): IRoute {
    this.routesConsideredCounter = 0;
    return this.recFindRoute(start, destination, List<Hop>(), 99999);
  }

  protected recFindRoute(
    start: Coordinates,
    destination: Coordinates,
    hops: List<Hop>,
    bestScore: number
  ): IRoute {
    this.routesConsideredCounter += 1;

    const current: IRoute = {
      destination,
      hops,
      score: this.calculateScore(start, destination, hops),
      start
    };

    let bs = Math.min(bestScore, current.score);

    // console.log(
    //   `${this.routesConsidered}: ${current.score} ${hops
    //     .map(h => h.blackhole.region)
    //     .toArray()}  --- ${this.calculateRunningScore(
    //     destination,
    //     hops
    //   )} < ${bs}`
    // );

    if (this.calculateRunningScore(destination, hops) < bs) {
      const closest: Hop[] = (() => {
        let dest = destination;
        if (!hops.isEmpty()) {
          dest = (hops.first() as Hop).blackhole.coords;
        }
        return this.closestByExit(dest).slice(0, 20);
      })();

      const potentialRoutes: IRoute[] = closest.map(hop => {
        const result = this.recFindRoute(
          start,
          destination,
          hops.unshift(hop),
          bs
        );
        bs = Math.min(bs, result.score);
        return result;
      });

      return List(potentialRoutes)
        .push(current)
        .minBy(r => r.score)!;
    } else {
      return current;
    }
  }
}

export { RouteCalculator, Route, IRoute };
