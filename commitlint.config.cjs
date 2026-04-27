/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'perf', 'docs', 'test', 'build', 'ci', 'chore', 'style', 'revert'],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'auth',
        'users',
        'lessons',
        'bookings',
        'notifications',
        'recordings',
        'video-call',
        'mobile',
        'backend',
        'design-tokens',
        'ui',
        'docs',
        'ci',
        'deps',
        'release',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'header-max-length': [2, 'always', 100],
  },
};
