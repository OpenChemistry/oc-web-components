exports.config = {
  namespace: 'molecule',
  outputTargets:[
    { 
      type: 'dist' 
    },
    { 
      type: 'www',
      serviceWorker: false
    }
  ],
  commonjs: {
    include: ['node_modules/**', '../molecule-vtkjs/node_modules/vtk.js/dist/vtk.js']
  }
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
}
