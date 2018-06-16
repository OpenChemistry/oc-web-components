export { IAtoms, IBonds, ICube, IChemJson };

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

interface IChemJson {
  atoms : IAtoms;
  bonds? : IBonds;
  cube? : ICube;
  [propName: string]: any;
}
