import { PATCH_CODE } from "./midiPatchCode";
import pkg from "../../package.json";

const { resourcesPath } = window.require("process");
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

/** @type {() => string} */
const getAppFileCode = () => fs.readFileSync(`${resourcesPath}/app/index.js`, { encoding: "utf8" });

export const checkMidiPermissionsInjector = () => {
  /** @type {string} */
  const appFileCode = getAppFileCode();
  const hasPatched = appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_");
  if (!hasPatched) return "unpatched";

  const codeInjected = appFileCode.substring(
    appFileCode.indexOf("// _WEBMIDI_PATCH_START_"),
    appFileCode.indexOf("_WEBMIDI_PATCH_END_") + "_WEBMIDI_PATCH_END_".length
  );

  if (codeInjected.trim() !== PATCH_CODE.trim()) return "outdated";

  return "patched";
}

export const injectMidiPermissions = () => {
  console.log("[WebMidiInjector] Injecting MIDI permissions...");
  
  const appFileCode = getAppFileCode();
  const appFileCodePatched = appFileCode + PATCH_CODE;
  
  // Write the patched file back to the app folder.
  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodePatched);

  console.log("[WebMidiInjector] Injected new MIDI permissions ! Please, restart BetterDiscord.");
  BdApi.showConfirmationModal(
    "Injected new MIDI permissions",
    `Please restart BetterDiscord to load them. Without them, the plugin "${pkg.className}" won't work.`, {
    confirmText: "Restart BD",
    onConfirm: () => {
      DiscordNative.app.relaunch();
    },

    cancelText: "Cancel",
    onCancel: () => undefined
  });
};

export const removeMidiPermissions = () => {
  console.log("[WebMidiInjector] Removing MIDI permissions...");
  
  const appFileCode = getAppFileCode();
  const appFileCodeCleaned = appFileCode.substring(
    0, appFileCode.indexOf("\n// _WEBMIDI_PATCH_START_")
  );

  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodeCleaned);
  console.log("[WebMidiInjector] Removed MIDI permissions.");
}

export const loadWebMidi = () => {
  ipcRenderer.send("_WEBMIDI_LOAD_");
  console.log("[WebMidiInjector] Loaded MIDI permissions injection.");
  return navigator.requestMIDIAccess({ sysex: true });
};
