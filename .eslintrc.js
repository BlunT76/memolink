module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "airbnb",
  ],
  "env": {
    "browser": true,
    "jest": true
  },
  "rules": {
    "no-underscore-dangle": "off",
    "import/prefer-default-export": "off",
    "jsx-a11y/label-has-for": "off",
    "react/jsx-filename-extension": "off",
    "jsx-a11y/no-noninteractive-element-to-interactive-role": "off",
    "no-unused-vars": ["error", { "args": "none" }],
    "react/jsx-one-expression-per-line": "off",
    "caughtErrors": "none",
    "camelcase": [0, {"properties": "never"}],
    "react/prop-types": 0,
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "to", "hrefLeft", "hrefRight" ],
      "aspects": [ "noHref", "invalidHref", "preferButton" ]
    }],
    "jsx-a11y/label-has-associated-control": [ 2, {
      "controlComponents": ["Field"],
    }],
  },
};