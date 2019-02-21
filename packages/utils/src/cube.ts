import { ICube } from '@openchemistry/types';

export class Cube implements ICube {
  public scalars: number[];

  constructor(
    public dimensions: [number, number, number],
    public origin: [number, number, number],
    public spacing: [number, number, number]
  ) {
    this.scalars = [];
  }

  pointsIterator() {
    const {dimensions, origin, spacing} = this;

    function* iter() {
      for (let i = 0; i < dimensions[0]; ++i) {
        for (let j = 0; j < dimensions[1]; ++j) {
          for (let k = 0; k < dimensions[2]; ++k) {
            let point: [number, number, number] = [
              origin[0] + i * spacing[0],
              origin[1] + j * spacing[1],
              origin[2] + k * spacing[2]
            ]
            yield point;
          }
        }
      }
      return;
    }

    return iter;
  }

  setScalars(scalars: number[]) {
    this.scalars = scalars;
  }
}
