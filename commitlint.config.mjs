/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow Renovate/Dependabot bump messages and scope-less commits.
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
