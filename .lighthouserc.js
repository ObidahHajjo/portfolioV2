module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
  desktop: {
    ci: {
      collect: {
        url: ['http://localhost:3000'],
        numberOfRuns: 3,
        settings: {
          preset: 'desktop',
          screenEmulation: {
            mobile: false,
            width: 1350,
            height: 940,
            deviceScaleFactor: 1,
          },
        },
      },
      assert: {
        assertions: {
          'categories:performance': ['error', { minScore: 0.9 }],
          'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
          'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
          'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
          'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        },
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  },
  mobile: {
    ci: {
      collect: {
        url: ['http://localhost:3000'],
        numberOfRuns: 3,
        settings: {
          preset: 'mobile',
          screenEmulation: {
            mobile: true,
            width: 390,
            height: 844,
            deviceScaleFactor: 3,
          },
          throttling: {
            rttMs: 40,
            throughputKbps: 10 * 1024,
            downloadThroughputKbps: 10 * 1024,
            uploadThroughputKbps: 10 * 1024,
            cpuSlowdownMultiplier: 4,
          },
        },
      },
      assert: {
        assertions: {
          'categories:performance': ['error', { minScore: 0.9 }],
          'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
          'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
          'interaction-to-next-paint': ['error', { maxNumericValue: 200 }],
          'total-blocking-time': ['warn', { maxNumericValue: 450 }],
        },
      },
      upload: {
        target: 'temporary-public-storage',
      },
    },
  },
};
