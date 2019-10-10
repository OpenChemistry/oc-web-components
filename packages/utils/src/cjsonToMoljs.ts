import { IChemJson, IAtoms, IBonds, IAtomSpec } from '@openchemistry/types';
import { numberOfAtoms } from './validation';
import { isNil } from "lodash-es";

export { cjsonToMoljs };

const elementSymbols = [
  "Xx", "H", "He", "Li", "Be", "B", "C", "N", "O", "F",
  "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K",
  "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu",
  "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y",
  "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In",
  "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr",
  "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm",
  "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au",
  "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac",
  "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es",
  "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt",
  "Ds", "Rg", "Cn", "Uut", "Uuq", "Uup", "Uuh", "Uus", "Uuo"
];

function cjsonToMoljs(cjson: IChemJson) : IAtomSpec[] {
  let atoms = atomsToMoljs(cjson.atoms);
  if (!isNil(cjson.bonds)) {
    atoms = bondsToMoljs(cjson.bonds, atoms);
  }
  return atoms;
}

function atomsToMoljs(atomsIn: IAtoms) : IAtomSpec[] {
  let atoms: IAtomSpec[] = [];
  let nAtoms : number = numberOfAtoms(atomsIn);
  for (let i = 0; i < nAtoms; ++i) {
    let s: string = atomsIn.elements.symbol
                    ? atomsIn.elements.symbol[i]
                    : elementSymbols[atomsIn.elements.number![i]];
    let x: number = atomsIn.coords['3d'][i * 3];
    let y: number = atomsIn.coords['3d'][i * 3 + 1];
    let z: number = atomsIn.coords['3d'][i * 3 + 2];
    atoms.push({
      elem: s,
      x: x,
      y: y,
      z: z
    });
  }
  return atoms;
}

function bondsToMoljs(bondsIn: IBonds, atoms: IAtomSpec[]) : IAtomSpec[] {
  let nBonds: number = Math.floor(bondsIn.connections.index.length / 2);
  let bondsOrder = Array.isArray(bondsIn.order) ? bondsIn.order : [];
  if (bondsOrder.length !== nBonds) {
    bondsOrder = [];
    for (let i = 0; i < nBonds; ++i) {
      bondsOrder.push(1);
    }
  }

  atoms.forEach(atom => {
    atom.bonds = [];
    atom.bondOrder = [];
  });

  for (let i = 0; i < nBonds; ++i) {
    let iAtom: number = bondsIn.connections.index[i * 2];
    let jAtom: number = bondsIn.connections.index[i * 2 + 1];
    atoms[iAtom].bonds!.push(jAtom);
    atoms[iAtom].bondOrder!.push(bondsOrder[i]);
    atoms[jAtom].bonds!.push(iAtom);
    atoms[jAtom].bondOrder!.push(bondsOrder[i]);
  }
  return atoms;
}
