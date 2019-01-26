import {
  Coordinates,
  coordinates as systemCoords,
  Hop,
  Platform,
  System,
  Wealth
} from "./coordinates";

interface ISystemIndexes {
  idxRegion: number;
  idxSystem: number;
  idxCoords: number;
  idxEconomy: number;
}

const idxPlatform = 0;
const idxGalaxy = 1;

const blackHoleIdxs: ISystemIndexes = {
  idxCoords: 4,
  idxEconomy: 12,
  idxRegion: 2,
  idxSystem: 3
};

const exitIdxs: ISystemIndexes = {
  idxCoords: 17,
  idxEconomy: 25,
  idxRegion: 15,
  idxSystem: 16
};

class SystemDef {
  constructor(
    public readonly indexes: ISystemIndexes,
    public readonly row: string[]
  ) {
    // todo
  }

  public get regionName(): string {
    return this.row[this.indexes.idxRegion];
  }

  public get systemName(): string {
    return this.row[this.indexes.idxSystem];
  }

  public get coordinates(): Coordinates {
    return systemCoords(this.row[this.indexes.idxCoords]);
  }

  public get economy(): Wealth {
    return parseInt(this.row[this.indexes.idxEconomy], 10);
  }

  public get system(): System {
    return new System(
      this.regionName,
      this.systemName,
      this.coordinates,
      this.economy
    );
  }
}

function extractHop(row: string[]): Hop {
  const platform: Platform = row[idxPlatform] as Platform;
  const galaxy: string = row[idxGalaxy];
  const blackHole: System = new SystemDef(blackHoleIdxs, row).system;
  const exit: System = new SystemDef(exitIdxs, row).system;

  return new Hop(platform, galaxy, blackHole, exit);
}

export { extractHop };

// export function extractBlackhole(row: string[]): System {}
