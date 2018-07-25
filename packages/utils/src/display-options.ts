import { IDisplayOptions, IIsoSurfaceOptions, IStyleOptions, INormalModeOptions, IVolumeOptions, IVisibilityOptions } from '@openchemistry/types';

export { defaultDisplayOptions, defaultStyleOptions, defaultIsoSurfaces, defaultNormalModeOptions };
export { composeDisplayOptions, composeStyleOptions, composeNormalModeOptions, composeIsoSurfaces};

import { isUndefined } from "lodash-es";

const defaultIsoSurfaces : IIsoSurfaceOptions[] = [
  {
    value: 0.005,
    color: "#ff0000",
    opacity: 0.85
  },
  {
    value: -0.005,
    color: "#0000ff",
    opacity: 0.85
  }
];

const defaultStyleOptions : IStyleOptions = {
  stick: {
    radius: 0.14,
  },
  sphere: {
    scale: 0.3,
  },
}

const defaultNormalModeOptions : INormalModeOptions = {
  play: true,
  modeIdx: -1,
  framesPerPeriod: 15,
  periodsPerSecond: 1,
  scale: 1
}

const defaultVolumeOptions: IVolumeOptions = {
  colors: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0 ,1]
  ],
  opacity: [
    1,
    0,
    1
  ]
};

const defaultVisibilityOptions: IVisibilityOptions = {
  volume: false,
  isoSurfaces: true
}

const defaultDisplayOptions: IDisplayOptions = {
  isoSurfaces: defaultIsoSurfaces,
  style: defaultStyleOptions,
  normalMode: defaultNormalModeOptions,
  volume: defaultVolumeOptions,
  visibility: defaultVisibilityOptions
};

function composeIsoSurfaces(isoSurfaces: IIsoSurfaceOptions[] | undefined) : IIsoSurfaceOptions[] {
  if (isUndefined(isoSurfaces)) {
    return defaultIsoSurfaces;
  }
  return isoSurfaces;
}

function composeNormalModeOptions(normalModeOptions: INormalModeOptions | undefined) : INormalModeOptions {
  if (isUndefined(normalModeOptions)) {
    return defaultNormalModeOptions;
  }
  return { ...defaultNormalModeOptions, ...normalModeOptions };
}

function composeStyleOptions(styleOptions: IStyleOptions | undefined) : IStyleOptions {
  if (isUndefined(styleOptions)) {
    return defaultStyleOptions;
  }
  return { ...defaultStyleOptions, ...styleOptions };
}

function composeVolumeOptions(volumeOptions: IVolumeOptions | undefined) : IVolumeOptions {
  if (isUndefined(volumeOptions)) {
    return defaultVolumeOptions;
  }
  return { ...defaultVolumeOptions, ...volumeOptions };
}

function composeVisibilityOptions(visibilityOptions: IVisibilityOptions | undefined) {
  if (isUndefined(visibilityOptions)) {
    return defaultVisibilityOptions;
  } else {
    return { ...defaultVisibilityOptions, ...visibilityOptions};
  }
}

function composeDisplayOptions(displayOptions: IDisplayOptions | undefined) : IDisplayOptions {
  if (isUndefined(displayOptions)) {
    return defaultDisplayOptions;
  }
  let optionsOut = {
    isoSurfaces: composeIsoSurfaces(displayOptions.isoSurfaces),
    style: composeStyleOptions(displayOptions.style),
    normalMode: composeNormalModeOptions(displayOptions.normalMode),
    volume: composeVolumeOptions(displayOptions.volume),
    visibility: composeVisibilityOptions(displayOptions.visibility)
  }
  return optionsOut;
}
