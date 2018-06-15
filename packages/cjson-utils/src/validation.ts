import { IChemJson, IAtoms, IBonds } from '@openchemistry/types';

export { validateChemJson, isChemJson, numberOfAtoms };

function isChemJson(obj: any) : obj is IChemJson {
  return obj.atoms !== undefined;
}

function validateChemJson(obj: IChemJson) : boolean {
  if (!validateAtoms(obj.atoms)) {
    return false;
  }
  if (obj.bonds) {
    // If bonds are invalid, throw them out but still keep the atoms
    if (!validateBonds(obj.atoms, obj.bonds)) {
      obj.bonds = undefined;
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
  if (bonds.order) {
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

function numberOfAtoms(atoms: IAtoms) : number {
  if (atoms.elements.number && atoms.elements.symbol) {
    if (atoms.elements.number.length !== atoms.elements.symbol.length) {
      return -1;
    }
    return atoms.elements.number.length;
  } else if (atoms.elements.number) {
    return atoms.elements.number.length;
  } else if (atoms.elements.symbol) {
    return atoms.elements.symbol.length;
  } else {
    return -1;
  }
}
