exports.config = {
  namespace: 'molecule-vtkjs',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: false
    }
  ]
};
