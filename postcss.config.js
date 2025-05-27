// module.exports = {
//   plugins: {
//     // Tell the tailwindcss plugin where to find its config file
//     tailwindcss: { config: "src/config/tailwind.config.js" },
//     autoprefixer: {},
//   },
// };

module.exports = {
  plugins: {
    tailwindcss: {}, // Let Tailwind auto-detect its config in the root
    autoprefixer: {},
  },
};
