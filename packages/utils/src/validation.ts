import { IChemJson, IAtoms, IBonds, ICube, IVibrations, IMolecularOrbitals } from '@openchemistry/types';
import { isNil } from "lodash-es";

export { validateChemJson, isChemJson, numberOfAtoms };

function isChemJson(obj: any) : obj is IChemJson {
  return obj.atoms !== undefined;
}

function validateChemJson(obj: IChemJson) : boolean {
  if (!validateAtoms(obj.atoms)) {
    console.warn('Invalid CJSON data, missing atoms');
    return false;
  }
  if (!isNil(obj.bonds)) {
    // If bonds are invalid, throw them out but still keep the atoms
    if (!validateBonds(obj.atoms, obj.bonds)) {
      console.warn('Invalid CJSON data, discarding bonds');
      obj.bonds = undefined;
    }
  }
  if (!isNil(obj.cube)) {
    // If cube data is invalid, throw it out but still keep the rest
    if (!validateCube(obj.cube)) {
      console.warn('Invalid CJSON data, discarding cube');
      obj.cube = undefined;
    }
  }
  if (!isNil(obj.vibrations)) {
    // If vibration data is invalid, throw it out but still keep the rest
    if (!validateVibrations(obj.atoms, obj.vibrations)) {
      console.warn('Invalid CJSON data, discarding vibrations');
      obj.vibrations = undefined;
    }
  }
  if (!isNil(obj.molecularOrbitals)) {
    // If orbitals data is invalid, throw it out but still keep the rest
    if (!validateMolecularOrbitals(obj.molecularOrbitals)) {
      console.warn('Invalid CJSON data, discarding molecular orbitals');
      obj.molecularOrbitals = undefined;
    }
  }
  return true;
}

function validateAtoms(atoms: IAtoms) : boolean {
  let nAtoms: number = numberOfAtoms(atoms);
  if (nAtoms < 0) {
    return false;
  }
  if (atoms.coords["3d"].length !== nAtoms * 3) {
    return false;
  }
  return true;
}

function validateBonds(atoms: IAtoms, bonds: IBonds) : boolean {
  let nAtoms: number = numberOfAtoms(atoms);
  if (!isNil(bonds.order)) {
    if (bonds.order.length * 2 !== bonds.connections.index.length) {
      return false;
    }
  } else {
    if (bonds.connections.index.length % 2 !== 0) {
      return false;
    }
  }
  for (let idx of bonds.connections.index) {
    if (idx >= nAtoms) {
      return false;
    }
  }
  return true;
}

function validateCube(cube: ICube) : boolean {
  let grid = cube.dimensions;
  let nPts = grid[0] * grid[1] * grid[2];
  let nScalars = cube.scalars.length;
  return nPts == nScalars;
}

function validateVibrations(atoms: IAtoms, vibrations: IVibrations) : boolean {
  if (isNil(vibrations.modes)) {
    return false;
  }
  let nModes: number = vibrations.modes.length;
  if (vibrations.frequencies && vibrations.frequencies.length !== nModes) {
    return false;
  }
  if (!isNil(vibrations.intensities) && vibrations.intensities.length !== nModes) {
    return false;
  }
  if (!isNil(vibrations.eigenVectors)) {
    if (vibrations.eigenVectors.length !== nModes) {
      return false;
    }
    let nAtoms: number = numberOfAtoms(atoms);
    for (let eigenVector of vibrations.eigenVectors) {
      if (eigenVector.length !== nAtoms * 3) {
        return false;
      }
    }
  }
  return true;
}

function validateMolecularOrbitals(mo: IMolecularOrbitals) : boolean {
  // There was a typo in avogadrolibs code...
  if (isNil(mo.occupations) && !isNil((mo as any).occpupations)) {
    mo.occupations = (mo as any).occpupations;
    return false;
  }
  if (mo.energies.length === mo.numbers.length && mo.energies.length === mo.occupations.length) {
    return true;
  }
  return false;
}

function numberOfAtoms(atoms: IAtoms) : number {
  if (!isNil(atoms.elements.number) && !isNil(atoms.elements.symbol)) {
    if (atoms.elements.number.length !== atoms.elements.symbol.length) {
      return -1;
    }
    return atoms.elements.number.length;
  } else if (!isNil(atoms.elements.number)) {
    return atoms.elements.number.length;
  } else if (!isNil(atoms.elements.symbol)) {
    return atoms.elements.symbol.length;
  } else {
    return -1;
  }
}
