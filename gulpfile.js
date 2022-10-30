/* eslint-disable */

/*
  *scss output style
  ** compact
  main {
    padding: 12px 24px;margin-bottom: 24px;
  }
  ** expanded
  main {
    padding: 12px 24px;
    margin-bottom: 24px;
  }
  ** compressed
  main{padding:12px 24px;margin-bottom:24px}
*/
const scssOptions = {
  // output
  outputStyle: "expanded",
  // indent
  indentWidth: 2,
  // comments
  sourceComments: false
}
const { stream } = require('browser-sync');
const { ESLint } = require('eslint')
const gulp = require('gulp'),
  // scss > css
  sass = require('gulp-sass'),
  // scss > css + scss sourcemaps
  sourcemap = require('gulp-sourcemaps'),
  // scss + prefix
  autoprefix = require('gulp-autoprefixer'),
  // scss + bourbon
  bourbon = require("bourbon").includePaths,
  // scss + bourbon
  neat = require("bourbon-neat").includePaths,
  // server
  browser = require('browser-sync').create(),
  // server + ssi
  connectSSI = require('connect-ssi'),
  // server + auto reload
  reload = browser.reload,
  // server + ssi > html(build)
  ssi = require("gulp-ssi"),
  // js merge
  concat = require('gulp-concat'),
  // js uglify
  uglify = require('gulp-uglify'),
  // js support ie10
  babel = require('gulp-babel'),
  // delete dist file
  del = require('del'),
  // js lint
  eslint = require('gulp-eslint'),
  // image image minify
  imagemin = require('gulp-imagemin');

const clean = () => del([dist]);

const src = './src'
const dist = './dist'
const path = {
  main: {
    src: src,
    dist: dist,
  },
  scss: {
    src: `${src}/assets/scss/**/*.scss`,
    dist: `${src}/assets/css/**/*.css`,
  },
  js: {
    src: `${src}/assets/js/*.js`,
    dist: `${dist}/assets/js`,
  },
  l10n: {
    src: `${src}/assets/js/l10n/*.js`,
    dist: `${dist}/assets/js/l10`,
  },
  inc: {
    src: `${src}/inc/**/*.inc`,
  },
  library: {
    src: `${src}/assets/lib/*.js`,
    temp: `${src}/assets/js/lib`,
    dist: `${dist}/assets/js/lib`,
  },
  css: {
    src: `${src}/assets/css`,
    dist: `${dist}/assets/css`,
  },
  images: {
    src: `${src}/assets/images/**/*.+(jpg|jpeg|png|gif)`,
    dist: `${dist}/assets/images`
  },
  font: {
    src: `${src}/assets/font/**/*.+(otf|woff|woff2)`,
    dist: `${dist}/assets/font`
  },
  html: {
    src: `${src}/**/*.html`,
    dist: `${dist}`
  },
  dashboard: {
    src: `${src}/dashboard/**/*.*`,
    dist: `${dist}/dashboard`
  }
}

// server
gulp.task('serv', () => {
  browser.init({
    open: 'external',
    routes: {},
    server: {
      baseDir: path.main,
      middleware: [connectSSI({
          baseDir: `${__dirname}/src/`,
          ext: '.html'
      })]
    },
    online: true,
    ghostMode: {
      clicks: false,
      forms: false,
      scroll: false
    }
  })

  // watch + compile + reload
  gulp.watch(path.scss.src, scss)
  gulp.watch(path.css.src).on('all', reload)
  gulp.watch(path.js.src, jsLint)
  gulp.watch(path.inc.src).on('change', reload)
  gulp.watch(path.images.src).on('all', reload)
  gulp.watch(path.html.src).on('change', reload)
  gulp.watch(path.library.src, concatJsTemp)
})

const l10n = () => {
  return gulp
    .src(path.l10n.src)
    .pipe(gulp.dest(path.l10n.dist))
}

// (scss + sourcemap) to css > src
const scss = () => {
  return gulp
    .src(path.scss.src)
    .pipe(sourcemap.init())
    .pipe(sass({
      sourcemaps: true,
      includePaths: [bourbon, neat]
    }).on('error', sass.logError))
    // .pipe(autoprefix())
    .pipe(sourcemap.write())
    .pipe(gulp.dest(path.css.src))
}

// lint
const jsLint =() => {
  return gulp
    .src(path.js.src)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(browser.stream())
}

// html + include > dist
const html = () => {
  return gulp
    .src(path.html.src)
    .pipe(ssi({
      root: path.main.src
    }))
    .pipe(gulp.dest(path.main.dist))
}

// conact & uglify > dist
const concatJs = () => {
  return gulp
    .src([path.library.src])
    .pipe(concat('lib.min.js'))
    // .pipe(uglify())
    .pipe(gulp.dest(path.library.dist))
}

// conact & uglify > src
const concatJsTemp = () => {
  return gulp
    .src([path.library.src])
    .pipe(concat('lib.min.js'))
    // .pipe(uglify())
    .pipe(gulp.dest(path.library.temp))
}

// image minify > dist
const image = () => {
  return gulp
    .src([path.images.src])
    .pipe(imagemin())
    .pipe(gulp.dest(path.images.dist))
}

// font > dist
const fonts = () => {
  return gulp
    .src(path.font.src)
    .pipe(gulp.dest(path.font.dist))
}

// scss to css > dist
const css = () => {
  return gulp
    .src(path.scss.src)
    .pipe(sass(scssOptions).on('error', sass.logError))
    .pipe(autoprefix())
    .pipe(gulp.dest(path.css.dist))
}

// js + bable > dist
const js = () => {
  return gulp
    .src(path.js.src)
    .pipe(babel())
    // .pipe(uglify())
    .pipe(gulp.dest(path.js.dist))
}

// dashboard > dist
const dashboard = () => {
  return gulp
    .src(path.dashboard.src)
    .pipe(gulp.dest(path.dashboard.dist))
}

// buile task
const build = gulp.series(
  clean,
  html,
  fonts,
  scss,
  css,
  concatJs,
  js,
  image,
  dashboard,
)
const buildjs = gulp.series(
  clean,
  concatJs,
  js,
)

gulp.task('default', gulp.series(scss, concatJsTemp, 'serv'))
gulp.task('build', build)
gulp.task('buildjs', buildjs)