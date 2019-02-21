import { ICube, IChemJson } from '@openchemistry/types';
import { Cube } from './cube';
import { cjsonToCube } from './cjsonToCube';
import { sum } from 'lodash-es';

export function evaluateMO(cjson: IChemJson, mo: number, dx: number = 0.05, padding: number = 2): Cube {
  let cube = cjsonToCube(cjson, dx, padding);

  let basis = new BasisSet(cjson);

  let n = basis.functions.length;

  if (mo >= n) {
    throw new Error('mo is too large');
  }

  let coefficients = cjson.orbitals.moCoefficients.slice(n * mo, n * mo + n);
  console.log('COEFFS ', coefficients);
  console.log('BASIS ', basis.functions);
  let scalars = [];

  const points = cube.pointsIterator()() as any;
  let next = points.next();
  while (!next.done) {
    let {value: point} = next;
    let value = 0;
    for (let i = 0; i < n; ++i) {
      value += coefficients[i] * basis.functions[i].evaluate(point);
    }
    scalars.push(value);
    next = points.next();
  }

  cube.setScalars(scalars);

  return cube;
}

export interface BasisFunction {
  evaluate: {(point: number[]): number}
}

export class GaussianFunction implements BasisFunction {

  constructor(
    private nPrimitives: number,
    private center: number[],
    private coefficients: number[],
    private exponents: number[]
  ) {
  }

  evaluate(point: number[]) : number {
    const ANG_TO_BOHR = 1.8897259886;

    let delta: number[] = [
      (point[0] - this.center[0]) * ANG_TO_BOHR,
      (point[1] - this.center[1]) * ANG_TO_BOHR,
      (point[2] - this.center[2]) * ANG_TO_BOHR
    ]

    let dr2: number = (
      delta[0] * delta[0] + 
      delta[1] * delta[1] + 
      delta[2] * delta[2]
    )

    let value = 0;
    for (let i = 0; i < this.nPrimitives; ++i) {
      value += this.coefficients[i] * this.evaluateBase(delta, dr2, this.exponents[i]);
    }
    return value;
  }

  evaluateBase(delta: number[], dr2: number, exponent: number) : number {
    throw new Error("Not implemented");
  }
}

export class GaussianFunctionS extends GaussianFunction {
  evaluateBase(delta: number[], dr2: number, exponent: number) : number {
    return Math.exp(- exponent * dr2);
  }
}

export class GaussianFunctionUU extends GaussianFunction {
  evaluateBase(delta: number[], dr2: number, exponent: number) : number {
    return 0 * Math.exp(- exponent * dr2);;
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

      let _coefficients = coefficients.slice(iPrimitive, iPrimitive + n);
      let _exponents = exponents.slice(iPrimitive, iPrimitive + n);

      let basisClasses = [];
      if (shellType == 0) {
        basisClasses = [GaussianFunctionS];
      } else if (shellType == 1) {
        basisClasses = [GaussianFunctionUU, GaussianFunctionUU, GaussianFunctionUU];
      } else {
        throw new Error(`Unknown shell type: ${shellType}`);
      }

      for (let basisClass of basisClasses) {
        this.functions.push(new basisClass(n, center, _coefficients, _exponents));
      }

      iPrimitive += n;
    }
  }
}
