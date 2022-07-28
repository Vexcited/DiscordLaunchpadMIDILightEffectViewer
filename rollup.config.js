const BD_PLUGIN_BANNER = `\
/**
 * @name DiscordLaunchpadMIDILightEffectViewer
 * @author Vexcited
 * @version 0.0.1
 * @description Launchpad MIDI visualizer for .mid files in Discord.
 * 
 * @website https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer
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
  }
};

export default config;