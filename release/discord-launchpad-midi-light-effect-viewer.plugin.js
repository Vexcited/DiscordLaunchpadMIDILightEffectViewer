/**
 * @name DiscordLaunchpadMIDILightEffectViewer
 * @author Vexcited
 * @version 0.0.1
 * @description Launchpad MIDI visualizer for .mid files in Discord.
 * 
 * @website https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer
 */

'use strict';

const PATCH_CODE = `
// _WEBMIDI_PATCH_START_
const { app, session, ipcMain } = require("electron");    
app.once("ready", () => {
  ipcMain.on("_WEBMIDI_LOAD_", () => {
    console.log("[WebMidiInjector] Loaded");
    
    session.defaultSession.setPermissionRequestHandler((_, permission, callback) => {
      console.log("[WebMidiInjector] Permission Requested");
      if (permission === "midi" || permission === "midiSysex") {
        console.log("[WebMidiInjector] Permission Granted");
        callback(true);
      }
    })
  });
});
// _WEBMIDI_PATCH_END_
`;

const { resourcesPath } = window.require("process");
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

const getAppFileCode = () =>  fs.readFileSync(`${resourcesPath}/app/index.js`, { encoding: "utf8" });

const injectWebMidiPermissions = () => {
  const appFileCode = getAppFileCode();
  const appFileCodePatched = appFileCode + "\n\n" + PATCH_CODE;

  // Write the patched file back to the app folder.
  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodePatched);
  // Gonna keep a backup in case.
  fs.writeFileSync(`${resourcesPath}/app/index.js.bak`, appFileCodePatched);
};

/** @type {MIDIAccess | null} */
let _WEBMIDI_ACCESS_ = null;
const getOutputs = () => {
  if (!_WEBMIDI_ACCESS_) return [];
  /** @type {MIDIOutput[]} */
  const outputs = [];

  for (const entry of _WEBMIDI_ACCESS_.outputs) {
    const output = entry[1];
    outputs.push(output);
  }

  return outputs;
};

class DiscordLaunchpadMIDILightEffectViewer {
  getName() { return "DiscordLaunchpadMIDILightEffectViewer" }
  getDescription() { return "Launchpad MIDI visualizer for .mid files in Discord." }
  getVersion() { return "0.0.1" }
  getAuthor() { return "Vexcited" }

  async start() {
    const appFileCode = getAppFileCode();

    if (appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_")) {
      console.log("[WebMidiInjector] Already patched, skipping.");
    } else injectWebMidiPermissions();

    // Load WebMIDI permissions.
    ipcRenderer.send("_WEBMIDI_LOAD_");
    _WEBMIDI_ACCESS_ = await navigator.requestMIDIAccess({ sysex: true });
    getOutputs();
  }

  stop() {}
}

module.exports = DiscordLaunchpadMIDILightEffectViewer;
