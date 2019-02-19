import { ICube } from '@openchemistry/types';

export class Cube implements ICube {
  public scalars: number[];
  private points: [number, number, number][];

  constructor(
    public dimensions: [number, number, number],
    public origin: [number, number, number],
    public spacing: [number, number, number]
  ) {
    this.scalars = [];
    this.points = [];
  }

  getPoints(): [number, number, number][] {
    if (this.points.length > 0) {
      return this.points;
    }

    let points: [number, number, number][] = [];
    for (let i = 0; i < this.dimensions[0]; ++i) {
      for (let j = 0; j < this.dimensions[1]; ++j) {
        for (let k = 0; k < this.dimensions[2]; ++k) {
          let point: [number, number, number] = [
            this.origin[0] + i * this.spacing[0],
            this.origin[1] + j * this.spacing[1],
            this.origin[2] + k * this.spacing[2]
          ]
          points.push(point);
        }
      }
    }

    this.points = points;
    return points;
  }

  setScalars(scalars: number[]) {
    this.scalars = scalars;
  }
}
