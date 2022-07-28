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
}

class DiscordLaunchpadMIDILightEffectViewer {
  getName() { return "DiscordLaunchpadMIDILightEffectViewer" }
  getDescription() { return "Launchpad MIDI visualizer for .mid files in Discord." }
  getVersion() { return "0.0.1" }
  getAuthor() { return "Vexcited" }

  /**
   * Functions to be called when
   * the plugin is disabled/stopped.
   */
  cleanFunctions = [];

  _setupUploadFilePatch () {
    const addFilesModule = BdApi.findModuleByProps("addFiles");
    const cleanAddFilesPatch = BdApi.monkeyPatch(addFilesModule, "addFiles", {
      instead: (e) => {
        const params = e.methodArguments[0];
        
        /** @type {{ file: File, platform: number }[]} */
        const files = params.files;
        const midiFiles = files.filter(({ file }) => file.name.endsWith(".mid"));
        const cleanedFiles = files.filter(({ file }) => !file.name.endsWith(".mid"));

        console.log("cleaned", cleanedFiles);
        if (midiFiles.length > 0) {
          console.log("midi", midiFiles);
          BdApi.alert("Detected a MIDI file !", "Do you want to share it as a light effect ?")
          return;
        }

        // Call it with modified parameters
        e.originalMethod.apply(e.thisObject, [{
          files: cleanedFiles,
          ...params
        }]);
      }
    });

    this.cleanFunctions.push(cleanAddFilesPatch);

    // const upload_module = BdApi.findModuleByProps("upload");
    // BdApi.monkeyPatch(upload_module, "upload", {
    //   instead: (e) => console.log("got upload", e)
    // });
  }

  async start() {
    const appFileCode = getAppFileCode();

    if (appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_")) {
      console.log("[WebMidiInjector] Already patched, skipping.");
    } else injectWebMidiPermissions();

    // Load WebMIDI permissions.
    ipcRenderer.send("_WEBMIDI_LOAD_");
    _WEBMIDI_ACCESS_ = await navigator.requestMIDIAccess({ sysex: true });

    // Setup upload file patch.
    this._setupUploadFilePatch();
  }

  stop () {
    // Clean up all the patches.
    this.cleanFunctions.forEach(f => f());
  }
}

export default DiscordLaunchpadMIDILightEffectViewer;
