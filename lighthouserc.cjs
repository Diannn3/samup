module.exports = {
  ci: {
    collect: {
      url: ['http://127.0.0.1:4321/', 'http://127.0.0.1:4321/explore/', 'http://127.0.0.1:4321/programs/'],
      numberOfRuns: 2,
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-gpu',
        preset: 'desktop',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500, aggregationMethod: 'optimistic' }],
        'total-blocking-time': ['error', { maxNumericValue: 200, aggregationMethod: 'optimistic' }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1, aggregationMethod: 'optimistic' }],
        'is-crawlable': 'error',
        'document-title': 'error',
        'meta-description': 'error',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
