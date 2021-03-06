const DEFAULT_SETTINGS = require('./utils/default_settings')
const getWebpackConfig = require('./utils/get_webpack_config')

const testType = process.env.TESTS || 'unit'

console.log(testType)

// Configuration Browser Testing with Sauce Labs
const sauceLabsLauncher = {
  /**
   * Chrome Test
   */
  sl_chrome_latest: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'latest',
    platform: 'macOS 10.12'
  },
  /**
   * Firefox
   */
  sl_firefox_latest: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'latest',
    platform: 'macOS 10.12'
  },
  /*
   * Internet Explorer
   */
  sl_internet_explorer: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '11.0',
    platform: 'Windows 7'
  }
  // ,
  // sl_edge_latest: {
  //   base: 'SauceLabs',
  //   browserName: 'microsoftedge'
  // },
  /*
   * Safari
   */
  // sl_safari: {
  //   base: 'SauceLabs',
  //   browserName: 'safari',
  //   platform: 'macOS 10.12',
  //   version: '10.0'
  // }
}

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // list of files / patterns to load in the browser
    files: (function () {
      if (testType === 'compiled') {
        return [
          { pattern: 'test/support/setup.js', watched: true },
          { pattern: 'dist/madkudu.min.js', watched: true },
          { pattern: 'test/support/teardown.js', watched: true },
          { pattern: 'test/compiled/window_changes.js', watched: true },
          { pattern: 'test/compiled/window.madkudu.js', watched: true }
        ]
      } else if (testType === 'jquery') {
        return [
          { pattern: 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js', watched: false },
          { pattern: 'test/support/setup.js', watched: true },
          { pattern: 'dist/madkudu.min.js', watched: true },
          { pattern: 'test/support/teardown.js', watched: true },
          { pattern: 'test/compiled/window.jquery.js', watched: true }
        ]
      } else if (testType === 'stripe') {
        return [
          { pattern: 'test/support/stripe_checkout.html', watched: true },
          { pattern: 'dist/madkudu.min.js', watched: true },
          { pattern: 'test/compiled/window.stripe.js', watched: true }
        ]
      } else if (testType === 'segment') {
        return [
          { pattern: 'test/support/segment.js', watched: true },
          { pattern: 'test/compiled/window.analytics.js', watched: true }
        ]
      } else if (testType === 'require') {
        return [
          { pattern: 'dist/madkudu.min.js', watched: true, included: false },
          { pattern: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.2/require.js' },
          { pattern: 'test/support/require_main.js' },
          { pattern: 'test/compiled/window.madkudu.js', watched: true }
        ]
      } else if (testType === 'snippet') {
        return [
          { pattern: 'test/support/setup.js', watched: true },
          { pattern: 'test/support/snippet.js', watched: true },
          { pattern: 'test/support/teardown.js', watched: true },
          { pattern: 'test/compiled/window.snippet.js', watched: true }
        ]
      } else if (testType === 'unit') {
        return [
          { pattern: 'test/support/setup.js', watched: true },
          { pattern: 'test/unit/*.js', watched: true },
          { pattern: 'test/support/teardown.js', watched: true }
        ]
      }
    })(),

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap'],
      'test/**/support/*.js': ['webpack']
    },

    webpack: getWebpackConfig(DEFAULT_SETTINGS, { test: true }),

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_INFO,
    logLevel: config.DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: process.env.DEV === 'true',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: (function () {
      if (process.env.BROWSERS) {
        return process.env.BROWSERS.split(',')
      } else if (process.env.PHANTOM === 'true') {
        return ['PhantomJS'].concat(Object.keys(sauceLabsLauncher))
      } else if (process.env.DEV === 'true') {
        return ['Chrome']
      } else {
        return ['Chrome', 'Firefox'] // 'Safari'
      }
    })(),

    // custom flag
    customLaunchers: sauceLabsLauncher,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: process.env.DEV !== 'true',

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    client: {
      captureConsole: true,
      mocha: {
        grep: process.env.GREP,
        reporter: 'html',
        timeout: 20000
      }
    },

    // Browser testing with Sauce Labs
    sauceLabs: {
      testName: require('./package.json').name
    },

    // How long does Karma wait for a browser to reconnect (in ms).
    browserDisconnectTimeout: 50000,
    browserNoActivityTimeout: 50000,
    browserDisconnectTolerance: 1,

    coverageReporter: {
      dir: 'dist/coverage/' + testType,
      reporters: [
        { type: 'text' },
        { type: 'lcov' }
      ]
    }

  })
}
