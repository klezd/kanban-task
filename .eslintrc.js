// .eslintrc.js
module.exports = {
  env: {
    browser: true, // Enables browser global variables like `window` and `document`
    es2021: true, // Enables ES2021 globals and syntax
    node: true, // Enables Node.js global variables and Node.js scoping (useful for config files themselves)
  },
  extends: [
    "eslint:recommended", // ESLint's built-in recommended rules
    "plugin:react/recommended", // Recommended rules for React
    "plugin:react-hooks/recommended", // Recommended rules for React Hooks
    "plugin:jsx-a11y/recommended", // Recommended accessibility rules for JSX
  ],
  parser: "@babel/eslint-parser", // Specifies the ESLint parser
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
    ecmaVersion: "latest", // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    requireConfigFile: false, // Set to false if you don't have a babel.config.js.
    // True if you have babel.config.js or similar.
    babelOptions: {
      presets: ["@babel/preset-react"], // Ensures JSX is parsed correctly by @babel/eslint-parser
    },
  },
  plugins: ["react", "react-hooks", "jsx-a11y"],
  settings: {
    react: {
      version: "detect", // Automatically detect the React version to use
    },
  },
  rules: {
    // You can add or override rules here. For example:
    // "react/react-in-jsx-scope": "off", // Not needed with React 17+ new JSX transform
    // "react/prop-types": "warn", // Warns if prop types are missing
    // Add any project-specific rules or disable rules you don't agree with.
  },
  globals: {
    // Add any other global variables your project uses that ESLint doesn't know about
    __firebase_config: "readonly",
    __app_id: "readonly",
    __initial_auth_token: "readonly",
  },
};
