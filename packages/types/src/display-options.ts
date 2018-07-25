export { IDisplayOptions, IIsoSurfaceOptions, IStyleOptions, INormalModeOptions, IVolumeOptions, IVisibilityOptions };

interface IIsoSurfaceOptions {
  value: number;
  color: string;
  opacity: number;
  smoothness?: number;
}

interface IStyleOptions {
  stick: {
    radius: number;
  };
  sphere: {
    scale: number;
  }
}

interface INormalModeOptions {
  play: boolean;
  modeIdx: number;
  framesPerPeriod?: number;
  periodsPerSecond?: number;
  scale?: number;
}

interface IVolumeOptions {
  colors: [number, number, number][];
  colorsScalarValue?: number[];
  opacity: number[];
  opacityScalarValue?: number[];
  range?: [number, number];
}

interface IVisibilityOptions {
  volume?: boolean;
  isoSurfaces?: boolean;
}

interface IDisplayOptions {
  isoSurfaces?: IIsoSurfaceOptions[];
  style?: IStyleOptions;
  normalMode?: INormalModeOptions;
  volume?: IVolumeOptions;
  visibility?: IVisibilityOptions;
}
