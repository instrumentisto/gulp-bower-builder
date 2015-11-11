# gulp-bower-builder
[![GitHub version](https://badge.fury.io/gh/instrumentisto%2Fgulp-bower-builder.svg)](https://badge.fury.io/gh/instrumentisto%2Fgulp-bower-builder)
[![npm version](https://badge.fury.io/js/gulp-bower-builder.svg)](https://badge.fury.io/js/gulp-bower-builder)
[![Dependency Status](https://david-dm.org/instrumentisto/gulp-bower-builder.svg)](https://david-dm.org/instrumentisto/gulp-bower-builder)
[![devDependency Status](https://david-dm.org/instrumentisto/gulp-bower-builder/dev-status.svg)](https://david-dm.org/instrumentisto/gulp-bower-builder#info=devDependencies)

[Gulp](http://gulpjs.com/) plugin for configurable building of front-end
libraries from [Bower](http://bower.io/) dependencies.



## Usage example

```javascript
var gulp = require('gulp'),
    closureCompiler = require('gulp-closure-compiler'),
    buildBowerLibraries = require('gulp-bower-builder');
    
gulp.task('build-libs', function() {
  return buildBowerLibraries({
    bowerDir: 'path/to/bower_components/',
    libsDir: 'public/lib/',
    libs: [
      {from: {'html5shiv/dist/html5shiv-printshiv.min.js': {}}},
      {from: {'js-cookie/src/js.cookie.js': {minify: true}}},
      {
        fromDir: 'webshim/js-webshim/minified/',
        from: {'polyfiller.js': {}},
        copyFiles: {
          src: 'shims/**/*.*',
          base: 'shims/',
          dest: 'shims/'
        }
      },
      {from: {
        'jquery/dist/jquery.min.js': {},
        'jquery-dataset/jquery.dataset.js': {minify: true}
      }},
      {
        fromDir: 'jquery-ui/ui/minified/',
        from: {
          'core.min.js': {prefix: 'jquery-ui-', skipVer: true},
          'widget.min.js': {skipVer: true},
          'mouse.min.js': {skipVer: true},
          'position.min.js': {skipVer: true},
          'draggable.min.js': {skipVer: true},
          'resizable.min.js': {skipVer: true},
          'button.min.js': {skipVer: true},
          'dialog.min.js': {}
        }
      }
    ],
    jsMinifier: function(filePath) {  // default is uglify()
      return closureCompiler({
        compilerPath: jsCompilerPath,
        fileName: path.basename(filePath),
        compilerFlags: {compilation_level: 'SIMPLE_OPTIMIZATIONS'}
      })
    }
  });
});
```
will produce next compressed files
```
./public/scripts/js/lib
├── html5shiv-printshiv.3.7.3.js
├── jquery-ui-core,widget,mouse,position,draggable,resizable,button,dialog.1.11.4.js
├── jquery.1.11.3,jquery.dataset.1.2.0.js
├── js.cookie.2.0.4.js
├── polyfiller.1.15.10.js
└── shims
    ├── FlashCanvas
    │   ├── canvas2png.js
    │   ├── flashcanvas.js
    │   └── flashcanvas.swf
    ... and other copied files
```
