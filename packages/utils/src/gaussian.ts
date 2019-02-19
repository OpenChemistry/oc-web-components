import { ICube, IChemJson } from '@openchemistry/types';
import { Cube } from './cube';
import { cjsonToCube } from './cjsonToCube';
import { sum } from 'lodash-es';

export function evaluateMO(cjson: IChemJson, mo: number, dx: number = 0.05): Cube {
  let cube = cjsonToCube(cjson, dx);

  let basis = new BasisSet(cjson);

  let n = basis.functions.length;

  if (mo >= n) {
    throw new Error('mo is too large');
  }

  let coefficients = cjson.orbitals.moCoefficients.slice(n * mo, n * mo + n);
  console.log('COEFFS ', coefficients);
  console.log('BASIS ', basis.functions);
  let scalars = [];

  for (let point of cube.getPoints()) {
    let value = 0;
    for (let i = 0; i < n; ++i) {
      value += coefficients[i] * basis.functions[i].evaluate(point);
    }
    scalars.push(value);
  }

  cube.setScalars(scalars);

  return cube;
}

export interface BasisFunction {
  evaluate: {(point: number[]): number}
}

export class GaussianFunction implements BasisFunction {

  constructor(
    private center: number[],
    private coefficient: number,
    private exponent: number
  ) {
  }

  evaluate(point: number[]) : number {
    let delta: number[] = [
      point[0] - this.center[0],
      point[1] - this.center[1],
      point[2] - this.center[2]
    ]

    let dr2: number = (
      delta[0] * delta[0] + 
      delta[1] * delta[1] + 
      delta[2] * delta[2]
    )

    return this.coefficient * this.evaluateBase(point, delta, dr2, this.exponent);
  }

  evaluateBase(point: number[], delta: number[], dr2: number, exponent: number) : number {
    throw new Error("Not implemented");
  }
}

export class GaussianFunctionS extends GaussianFunction {
  evaluateBase(point: number[], delta: number[], dr2: number, exponent: number) : number {
    return Math.exp(- exponent * dr2);
  }
}

export class GaussianFunctionUU extends GaussianFunction {
  evaluateBase(point: number[], delta: number[], dr2: number, exponent: number) : number {
    return 0;
  }
}

export class BasisSet {
  public functions: BasisFunction[];

  constructor(cjson: IChemJson) {
    this.functions = [];

    if (!cjson.basisSet) {
      return;
    }

    let atoms = cjson.atoms;
    let exponents: number[] = (cjson.basisSet as any).exponents;
    let coefficients: number[] = (cjson.basisSet as any).coefficients;
    let primitivesPerShell: number[] = (cjson.basisSet as any).primitivesPerShell;
    let shellToAtomMap: number[] = (cjson.basisSet as any).shellToAtomMap;
    let shellTypes: number[] = (cjson.basisSet as any).shellTypes;

    let n = exponents.length;

    if (n !== coefficients.length) {
      throw new Error("Error in basisSet");
    }

    if (n !== sum(primitivesPerShell)) {
      throw new Error("Error in basisSet");
    }

    let iPrimitive = 0;
    for (let iShell = 0; iShell < primitivesPerShell.length; ++iShell) {
      let n = primitivesPerShell[iShell];
      let iAtom = shellToAtomMap[iShell];
      let shellType = shellTypes[iShell];
      let center = atoms.coords['3d'].slice(3 * iAtom, 3 * iAtom + 3);
      for (let i = 0; i < n; ++i) {
        let coefficient = coefficients[iPrimitive];
        let exponent = exponents[iPrimitive];
        if (shellType == 0) {
          this.functions.push(new GaussianFunctionS(center, coefficient, exponent));
        } else {
          this.functions.push(new GaussianFunctionUU(center, coefficient, exponent));
        }
        iPrimitive += 1;
      }
    }
  }
}
