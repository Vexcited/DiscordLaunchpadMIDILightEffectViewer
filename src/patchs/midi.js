import pkg from "../../package.json";

const { resourcesPath } = window.require("process");
const { ipcRenderer } = window.require("electron");
const fs = window.require("fs");

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
    `Please restart BetterDiscord to load them. Without it, the plugin "${pkg.className}" won't work.`, {
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
  return navigator.requestMIDIAccess({ sysex: true });
};
