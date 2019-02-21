import { IChemJson, IAtoms } from '@openchemistry/types';
import { Cube } from './cube';

type Vec3 = [number, number, number];
type Vec6 = [number, number, number, number, number, number];

export function cjsonToCube(cjson: IChemJson, dx: number = 0.05, padding: number = 2): Cube {
  let bounds = calcBoxBounds(cjson.atoms, padding);

  let spacing: Vec3 = [dx, dx, dx];
  let origin: Vec3 = [bounds[0], bounds[2], bounds[4]];
  let dimensions: Vec3 = [
    Math.floor((bounds[1] - bounds[0]) / spacing[0]),
    Math.floor((bounds[3] - bounds[2]) / spacing[1]),
    Math.floor((bounds[5] - bounds[4]) / spacing[2])
  ]

  return new Cube(dimensions, origin, spacing);
}

function calcBoxBounds(atoms: IAtoms, padding: number): Vec6 {
  let minima: Vec3 = [Infinity, Infinity, Infinity];
  let maxima: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < atoms.coords['3d'].length; ++i) {
    let coord = atoms.coords['3d'][i];
    let j = i % 3;
    if (minima[j] > coord) {
      minima[j] = coord;
    }

    if (maxima[j] < coord) {
      maxima[j] = coord;
    }
  }
  let bounds: Vec6 = [
    minima[0] - padding, maxima[0] + padding,
    minima[1] - padding, maxima[1] + padding,
    minima[2] - padding, maxima[2] + padding
  ]

  return bounds;
}
