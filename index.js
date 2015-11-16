var fs = require('fs'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    trimContent = require('gulp-trim'),
    uglify = require('gulp-uglify'),
    merge = require('merge-stream'),
    path = require('path'),
    streamQueue = require('streamqueue'),
    extend = require('xtend');


module.exports = function(options) {
  var o = extend({
    bowerComponentsDir: 'bower_components/',
    libsDir: 'lib/',
    libs: [],
    jsMinifier: function() {
      return uglify();
    }
  }, options);

  return merge.apply(null, o.libs.map(function(lib) {
    var depNames = [], depName, depVersion, libExt,
        depDir = lib.fromDir ? lib.fromDir : '',
        libsStream = streamQueue({objectMode: true}),
        fullStream = streamQueue({objectMode: true});

    for (var depKey in lib.from) {
      if (!lib.from.hasOwnProperty(depKey)) {
        continue;
      }
      var relPath = depDir + depKey,
          relPathParsed = path.parse(relPath);

      depName = lib.from[depKey].name ? lib.from[depKey].name :
                relPathParsed.name.replace(/\.min$/, '');
      libExt = !libExt ? relPathParsed.ext : libExt;
      if (!lib.from[depKey].skipVer) {
        depVersion = JSON.parse(fs.readFileSync(
            path.resolve(process.cwd(), o.bowerComponentsDir) +
            '/' + relPath.split('/')[0] + '/.bower.json'))._release;
        depName += '.' + depVersion;
      }
      if (lib.from[depKey].prefix) {
        depName = lib.from[depKey].prefix + depName;
      }
      depNames.push(depName);

      libsStream.queue((function(filePath, minify) {
        return gulp.src(filePath)
            .pipe(gulpif(minify, o.jsMinifier(filePath)))
            .pipe(trimContent());
      })(o.bowerComponentsDir + relPath,
          (!!lib.from[depKey].minify && (libExt === '.js'))));

      if (lib.copyFiles) {
        lib.copyFiles = Array.isArray(lib.copyFiles) ?
                        lib.copyFiles : [lib.copyFiles];
        lib.copyFiles.forEach(function(coll) {
          fullStream.queue(
              gulp.src(o.bowerComponentsDir + depDir + coll.src,
                  {base: o.bowerComponentsDir + depDir + coll.base})
                  .pipe(gulp.dest(o.libsDir + coll.dest)));
        });
      }
    }

    return fullStream.done(
        libsStream.done()
            .pipe(concat(depNames.join(',') + libExt))
            .pipe(gulp.dest(o.libsDir)));
  }));
};
