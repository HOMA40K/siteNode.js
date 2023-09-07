/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.html"],
  daisyui: {
    themes: ["aqua", 
      {
        mytheme: {

          "primary": "#1d3a6d",

          "secondary": "#f4b5c0",

          "accent": "#c0ed65",

          "neutral": "#fff",

          "base-100": "#fff",

          "info": "#3a9acb",

          "success": "#76e5d8",

          "warning": "#f3bc30",

          "error": "#f34965",
        },
      },
    ],
  },
  theme: {
    
    extend: {
    },
  },
  plugins: [require("daisyui")],
}

