const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  eslint: {
    enable: true,
    mode: 'extends',
    configure: {
      extends: ['.eslintrc.js']
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
      }
    }
  }
};
