import pkg from "../../package.json";

const { resourcesPath } = window.require("process");
const { ipcRenderer } = window.require("electron");
const { resolve } = require("path");
const fs = window.require("fs");

const PATCH_CODE = fs.readFileSync(resolve(__dirname, "midiPatchCode.js"), "utf8");

const getAppFileCode = () =>  fs.readFileSync(`${resourcesPath}/app/index.js`, { encoding: "utf8" });
export const midiPermissionsInjected = () => {
  const appFileCode = getAppFileCode();
  return appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_");
}

export const injectMidiPermissions = () => {
  console.log("[WebMidiInjector] Injecting MIDI permissions...");
  
  const appFileCode = getAppFileCode();
  const appFileCodePatched = appFileCode + "\n\n" + PATCH_CODE;
  
  // Write the patched file back to the app folder.
  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodePatched);
  // Gonna keep a backup in case.
  fs.writeFileSync(`${resourcesPath}/app/index.js.bak`, appFileCodePatched);

  console.log("[WebMidiInjector] Injected MIDI permissions ! Please, restart BetterDiscord.");
  BdApi.showConfirmationModal(
    "Injected MIDI permissions",
    `Please restart BetterDiscord to load them. Without them, the plugin "${pkg.className}" won't work.`, {
    confirmText: "Restart BD",
    onConfirm: () => {
      DiscordNative.app.relaunch();
    },

    cancelText: "Cancel",
    onCancel: () => undefined
  });
};

export const loadWebMidi = () => {
  ipcRenderer.send("_WEBMIDI_LOAD_");
  console.log("[WebMidiInjector] Loaded MIDI permissions injection.");
  return navigator.requestMIDIAccess({ sysex: true });
};
