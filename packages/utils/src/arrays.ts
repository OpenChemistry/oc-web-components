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
