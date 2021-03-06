# gulp-bower-builder
[![GitHub release](https://img.shields.io/github/release/instrumentisto/gulp-bower-builder.svg)](https://github.com/instrumentisto/gulp-bower-builder)
[![npm version](https://img.shields.io/npm/v/gulp-bower-builder.svg)](https://www.npmjs.com/package/gulp-bower-builder)
[![npm license](https://img.shields.io/npm/l/gulp-bower-builder.svg)](https://github.com/instrumentisto/gulp-bower-builder/blob/master/LICENSE.md)
[![dependencies](https://img.shields.io/david/instrumentisto/gulp-bower-builder.svg)](https://david-dm.org/instrumentisto/gulp-bower-builder)
[![devDependencies](https://img.shields.io/david/dev/instrumentisto/gulp-bower-builder.svg)](https://david-dm.org/instrumentisto/gulp-bower-builder#info=devDependencies)

[Gulp](http://gulpjs.com/) plugin for configurable building of front-end
libraries from [Bower](http://bower.io/) dependencies.



## Usage example

You can play with it in `example/` directory.

```javascript
var gulp = require('gulp'),
    closureCompiler = require('gulp-closure-compiler'),
    buildBowerLibraries = require('gulp-bower-builder'),
    minifyCss = require('gulp-minify-css'),
    path = require('path');

    
gulp.task('build-libs', function() {
  return buildBowerLibraries({
    bowerDir: 'bower_components/',
    destDir: 'out/js/',  // default destination of generated libs
    libs: [
      {from: {'html5shiv/dist/html5shiv-printshiv.min.js': {}}},
      {from: {'js-cookie/src/js.cookie.js': {minify: true}}},
      {from: {'chosen/chosen.jquery.js': {
        name: 'jquery.chosen', minify: true
      }}},
      {
        from: {'chosen/chosen.css': {name: 'jquery.chosen', minify: true}},
        destDir: 'out/css/jquery.chosen/',  // overwrites default destination
        copyFiles: {
          src: 'chosen/chosen-sprite*.png',
          base: 'chosen/'
        }
      },
      {
        fromDir: 'webshim/js-webshim/minified/',  // relative to bowerDir
        from: {'polyfiller.js': {}},
        copyFiles: {
          src: 'shims/**/*.*',
          base: 'shims/',
          destDir: 'shims/'  // relative to already defined destDir
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
      },
      {from: {
        'better-dom/dist/better-dom.min.js': {},
        'better-i18n-plugin/dist/better-i18n-plugin.js': {
          name: 'i18n-plugin', minify: true
        },
        'better-dateinput-polyfill/dist/better-dateinput-polyfill.js': {
          name: 'dateinput-polyfill', minify: true, skipVer: true
        },
        'better-dateinput-polyfill/i18n/better-dateinput-polyfill.ru.js': {
          name: 'ru', minify: true
        }
      }}
    ],
    minifier: {
      js: function(filePath) {  // default is uglify()
        return closureCompiler({
          compilerPath: 'bower_components/closure-compiler/compiler.jar',
          fileName: path.basename(filePath),
          compilerFlags: {compilation_level: 'SIMPLE_OPTIMIZATIONS'}
        });
      },
      css: function() {  // default is gulp-minify-css
        return minifyCss({restructuring: false});
      }
    }
  });
});
```
produces next compressed files
```
$ tree out
out
├── css
│   └── jquery.chosen
│       ├── chosen-sprite.png
│       ├── chosen-sprite@2x.png
│       └── jquery.chosen.1.5.1.css
└── js
    ├── better-dom.2.1.4,i18n-plugin.1.0.3,dateinput-polyfill,ru.1.5.2.js
    ├── html5shiv-printshiv.3.7.3.js
    ├── jquery-ui-core,widget,mouse,position,draggable,resizable,button,dialog.1.11.4.js
    ├── jquery.1.11.3,jquery.dataset.1.2.0.js
    ├── jquery.chosen.1.5.1.js
    ├── js.cookie.2.0.4.js
    ├── polyfiller.1.15.10.js
    └── shims
        ├── FlashCanvas
        │   ├── canvas2png.js
        │   ├── flashcanvas.js
        │   └── flashcanvas.swf
        ... and other copied files
```
