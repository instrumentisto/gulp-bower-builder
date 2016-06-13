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
