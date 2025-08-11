// Map deprecated react-dom/test-utils act to React.act to suppress warnings in tests
const React = require("react");

module.exports = {
  act: React.act
};

