var extend = require('extend'),
    fs = require('fs'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    trimContent = require('gulp-trim'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    merge = require('merge-stream'),
    path = require('path'),
    serie = require('stream-series');


module.exports = main;


/**
 * Performs libraries building according to passed options.
 *
 * @param {string} [options.bowerDir=bower_components/]  Path to directory (from
 *            working directory relatively) where Bower components where loaded.
 * @param {string} [options.destDir=lib/]  Default destination directory path
 *                                         of building result.
 * @param {Object[]} options.libs  List of libraries options that must be built.
 * @param {Function} [options.minifier.js]  Custom function that minifies .js
 *                                          files in Gulp stream.
 * @param {Function} [options.minifier.css]  Custom function that minifies .css
 *                                           files in Gulp stream.
 *
 * @returns {Stream}    Performed Gulp stream.
 */
function main(options) {
  var o = extend(true, {
    bowerDir: 'bower_components/',
    destDir: 'lib/',
    libs: [],
    minifier: {
      js: function() {
        return uglify();
      },
      css: function () {
        return minifyCss();
      }
    }
  }, options);

  /**
   * Returns gulp stream that minifies file with required minificator if
   * given condition evaluates to "true".
   *
   * @param {boolean} condition   Informs if file must be minified or not.
   * @param {string} filePath     File path that can be required by some
   *                              minificators (e.g. Closure Compiler).
   *
   * @returns {Stream}    Gulp stream that can be piped.
   */
  function minifyIf(condition, filePath) {
    var fileExt = path.parse(filePath).ext.replace('.', '');
    condition = condition && ((fileExt === 'js') || (fileExt === 'css'));
    return gulpif(condition, condition ? o.minifier[fileExt](filePath) : true);
  }

  return merge.apply(null, o.libs.map(function(lib) {
    var depNames = [], depName, depVersion, libExt,
        depDir = lib.fromDir ? lib.fromDir : '',
        destDir = lib.destDir ? lib.destDir : o.destDir,
        libsTasks = [], allTasks = [];

    for (var depKey in lib.from) {
      if (!lib.from.hasOwnProperty(depKey)) {
        continue;
      }
      var relPath = depDir + depKey,
          relPathParsed = path.parse(relPath),
          fromItem = lib.from[depKey];

      depName = fromItem.name ? fromItem.name :
                relPathParsed.name.replace(/[\.-]min$/, '');
      libExt = !libExt ? relPathParsed.ext : libExt;
      if (!fromItem.skipVer) {
        depVersion = JSON.parse(fs.readFileSync(
            path.resolve(process.cwd(), o.bowerDir) +
            '/' + relPath.split('/')[0] + '/.bower.json'))._release;
        depName += '.' + depVersion;
      }
      if (fromItem.prefix) {
        depName = fromItem.prefix + depName;
      }
      depNames.push(depName);

      libsTasks.push(
          gulp.src(o.bowerDir + relPath)
              .pipe(minifyIf(!!fromItem.minify, relPath))
              .pipe(trimContent()));
    }
    if (libsTasks.length > 0) {
      allTasks.push(
          serie.apply(null, libsTasks)
              .pipe(concat(depNames.join(',') + libExt))
              .pipe(gulp.dest(destDir)));
    }

    if (lib.copyFiles) {
      lib.copyFiles = Array.isArray(lib.copyFiles) ?
                      lib.copyFiles : [lib.copyFiles];
      lib.copyFiles.forEach(function(coll) {
        allTasks.push(
            gulp.src(o.bowerDir + depDir + coll.src,
                     {base: coll.base ? (o.bowerDir + depDir + coll.base) : ''})
                .pipe(minifyIf(!!coll.minify, o.bowerDir + depDir + coll.src))
                .pipe(gulpif(!!coll.minify, trimContent()))
                .pipe(gulp.dest(destDir + (coll.destDir || ''))));
      });
    }

    return merge.apply(null, allTasks);
  }));
}
