export function rowMaj2colMaj3d(scalars: number[], dims: [number, number, number]) : Float32Array {
  const tmp = new Float32Array(scalars.length);
  for (let i = 0; i < dims[0]; i++) {
    for (let j = 0; j < dims[1]; j++) {
      for (let k = 0; k < dims[2]; k++) {
        tmp[i + dims[0] * (j + k * dims[1])] = scalars[(i * dims[1] + j) * dims[2] + k];
      }
    }
  }
  return tmp;
}

export function makeBins(scalars: number[], nBins = 50, range: number[] | undefined = undefined) {
  let h = [];
  for (let i = 0; i <= nBins; ++i) {
    h.push(0);
  }

  if (!range) {
    range = [0, 0];
    range[0] = Math.min(...scalars);
    range[1] = Math.max(...scalars);
  }

  let delta = range[1] - range[0];

  for (let i = 0; i < scalars.length; ++i) {
    let idx = Math.floor(nBins * (scalars[i] - range[0]) / delta);
    if (idx <= nBins && idx > 0) {
      h[idx]++;
    }
  }
  return h;
}