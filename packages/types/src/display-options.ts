export { IDisplayOptions, IIsoSurface, IStyle };

interface IIsoSurface {
  value: number;
  color: string;
  opacity: number;
  smoothness?: number;
}

interface IStyle {
  stick: {
    radius: number;
  };
  sphere: {
    scale: number;
  }
}

interface IDisplayOptions {
  isoSurfaces?: IIsoSurface[];
  style?: IStyle;
}
