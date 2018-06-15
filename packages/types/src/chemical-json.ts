export { IAtoms, IBonds, IChemJson };

interface IAtoms {
  coords : {
    ["3d"] : number[];
  };
  elements : {
    number : number[];
    symbol : string[];
  }
}

interface IBonds {
  connections : {
    index : number[];
  };
  order : number[];
}

interface IChemJson {
  atoms : IAtoms;
  bonds? : IBonds;
  [propName: string]: any;
}
