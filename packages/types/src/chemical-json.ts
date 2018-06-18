export { IAtoms, IBonds, ICube, IChemJson, IVibrations };

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

interface IChemJson {
  atoms : IAtoms;
  bonds? : IBonds;
  cube? : ICube;
  vibrations?: IVibrations;
  [propName: string]: any;
}
