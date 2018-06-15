export interface IAtomSpec {
  elem: string;
  x: number;
  y: number;
  z: number;
  bonds?: number[];
  bondOrder?: number[];
  [propName: string]: any;
}
