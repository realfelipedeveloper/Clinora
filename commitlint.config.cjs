module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
    'scope-enum': [
      2,
      'always',
      [
        'agents',
        'apps',
        'docs',
        'git',
        'infra',
        'libs',
        'services',
        'spec',
        'tools',
      ],
    ],
  },
};

