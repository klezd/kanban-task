/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This path is relative to the project root
    "./public/index.html",
    "./src/App.js",
  ],
  theme: {
    extend: {
      colors: {
        // Your custom palette
        spearmint: {
          50: "#F0F3F2",
          100: "#E1E7E6",
          200: "#C4CFCD",
          300: "#A7B7B5",
          400: "#91A5A1", // Original, using as shade 400
          DEFAULT: "#91A5A1", // Original as DEFAULT
          500: "#91A5A1", // Original as 500
          600: "#7E908D",
          700: "#6A7C79",
          800: "#576765",
          900: "#435351",
          950: "#35413F",
        },
        "misty-blue": {
          50: "#EDF3F6",
          100: "#DAE7EC",
          200: "#B6CFD9",
          300: "#92B7C6",
          400: "#81ABBC", // Original, using as shade 400
          DEFAULT: "#81ABBC", // Original as DEFAULT
          500: "#81ABBC", // Original as 500
          600: "#6D93A3",
          700: "#5A7A8A",
          800: "#466271",
          900: "#334A58",
          950: "#273A45",
        },
        tangerine: {
          50: "#FEF6E6",
          100: "#FCEECB",
          200: "#F9DD98",
          300: "#F5CC64",
          400: "#F0BD58",
          DEFAULT: "#E6B451", // Original as DEFAULT
          500: "#E6B451", // Original as 500
          600: "#D6A23F",
          700: "#B88A35",
          800: "#99712C",
          900: "#7A5922",
          950: "#4D3815",
        },
        "olive-green": {
          50: "#E9ECE8",
          100: "#D2D8D1",
          200: "#A6B1A3",
          300: "#798B76",
          400: "#6C7D65",
          DEFAULT: "#5E6E54", // Original as DEFAULT
          500: "#5E6E54", // Original as 500
          600: "#4F5C47",
          700: "#3F4A3A",
          800: "#30382D",
          900: "#20261F",
          950: "#1A1F19",
        },
      },
    },
  },
  plugins: [],
};

