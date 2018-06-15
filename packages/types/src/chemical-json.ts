export interface IAtoms {
  coords : {
    ["3d"] : number[];
  };
  elements : {
    number : number[];
    symbol : string[];
  }
}

export interface IBonds {
  connections : {
    index : number[];
  };
  order : number[];
}

export interface IChemJson {
  atoms : IAtoms;
  bonds? : IBonds;
  [propName: string]: any;
}

// export {IAtoms, IBonds, IChemJson};