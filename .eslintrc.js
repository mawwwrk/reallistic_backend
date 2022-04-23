const myConfig = process.env.eslintrc;

const config = {
  root: true,
  env: {
    esnext: true,
    node: true,
  },
  extends: [myConfig],
};

module.exports = config;
