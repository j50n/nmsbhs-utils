type Coords = [number, number, number, number];
const reCoord = /^([0-9a-f]{1,4}):([0-9a-f]{1,4}):([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i;

export function coordinates(text: string): Coordinates {
  const parts = reCoord.exec(text);
  if (parts == null) {
    throw new SyntaxError(`not valid galactic coordinates: '${text}'`);
  } else {
    const args = parts.slice(1, 5).map(i => parseInt(i, 16)) as Coords;
    return new Coordinates(...args);
  }
}

export class Coordinates {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly system: number
  ) {
    if (!Number.isInteger(x)) {
      throw new RangeError(`x must be an integer value: ${x}`);
    }
    if (!Number.isInteger(y)) {
      throw new RangeError(`y must be an integer value: ${y}`);
    }
    if (!Number.isInteger(z)) {
      throw new RangeError(`z must be an integer value: ${z}`);
    }
    if (!Number.isInteger(system)) {
      throw new RangeError(`system must be an integer value: ${system}`);
    }

    if (x < 0 || x > 0xfff) {
      throw new RangeError(
        `x must be in range 0x0 to 0xFFF: 0x${x.toString(16)}`
      );
    }
    if (y < 0 || y > 0xff) {
      throw new RangeError(
        `y must be in range 0x0 to 0xFF: 0x${y.toString(16)}`
      );
    }
    if (z < 0 || z > 0xfff) {
      throw new RangeError(
        `z must be in range 0x0 to 0xFFF: 0x${z.toString(16)}`
      );
    }
    if (system < 0 || system > 0x2ff) {
      throw new RangeError(
        `system must be in range 0x0 to 0x2FF: 0x${system.toString(16)}`
      );
    }
  }

  public get dist2(): number {
    return Math.sqrt((this.x - 0x7ff) ** 2 + (this.z - 0x7ff) ** 2);
  }

  public get radial2(): number {
    let r = Math.atan2(-1 * (this.z - 0x7ff), this.x - 0x7ff);
    if (r < 0) {
      r = r + 2 * Math.PI;
    }
    return (r * 180) / Math.PI;
  }
}

export enum Platform {
  PS4 = "PS4",
  PC = "PC",
  XBOX = "XBOX"
}

export enum Wealth {
  Low = 1,
  Middle = 2,
  High = 3
}

export class System {
  constructor(
    region: string,
    system: string,
    coords: Coordinates,
    economy: Wealth
  ) {
    // yes empty
  }
}
