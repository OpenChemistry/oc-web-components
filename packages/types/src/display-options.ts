export { IDisplayOptions, IIsoSurfaceOptions, IStyleOptions, INormalModeOptions };

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

interface IDisplayOptions {
  isoSurfaces?: IIsoSurfaceOptions[];
  style?: IStyleOptions;
  normalMode?: INormalModeOptions;
}
