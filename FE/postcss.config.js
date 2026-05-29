import autoprefixer from "autoprefixer";
import tailwindPostcss from "@tailwindcss/postcss";

export default {
  plugins: [tailwindPostcss(), autoprefixer()],
};
