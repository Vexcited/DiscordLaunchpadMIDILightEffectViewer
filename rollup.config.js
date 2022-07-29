import pkg from "./package.json";
import json from '@rollup/plugin-json';

const BD_PLUGIN_BANNER = `\
/**
 * @name ${pkg.className}
 * @author ${pkg.author.name}
 * @version ${pkg.version}
 * @description ${pkg.description}
 * @website ${pkg.homepage}
 */
`;

/** @type {import("rollup").RollupOptions} */
const config = {
  input: "src/index.js",
  output: {
    file: "release/discord-launchpad-midi-light-effect-viewer.plugin.js",
    banner: BD_PLUGIN_BANNER,

    exports: "default",
    format: "cjs"
  },
  plugins: [json()]
};

export default config;