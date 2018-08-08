export { IAtoms, IBonds, ICube, IChemJson, IVibrations, IMolecularOrbitals, IProperties, IBasisSet };

interface IAtoms {
  coords : {
    ["3d"] : number[];
  };
  elements : {
    number? : number[];
    symbol? : string[];
  }
}

interface IBonds {
  connections : {
    index : number[];
  };
  order : number[];
}

interface ICube {
  dimensions: [number, number, number];
  origin: [number, number, number];
  spacing: [number, number, number];
  scalars: number[];
}

interface IVibrations {
  eigenVectors?: number[][];
  frequencies?: number[];
  intensities?: number[];
  modes: number[];
}

interface IMolecularOrbitals {
  energies: number[];
  numbers: number[];
  occupations: number[];
}

interface IProperties {
  electronCount: number;
  functionalName: string;
  scfType: string;
  theory: string;
}

interface IBasisSet {
  basisType: string;
  electronCount: number;
  scfType: string;
}

interface IChemJson {
  atoms : IAtoms;
  bonds? : IBonds;
  cube? : ICube;
  vibrations?: IVibrations;
  molecularOrbitals?: IMolecularOrbitals;
  properties?: IProperties;
  basisSet?: IBasisSet;
  [propName: string]: any;
}
