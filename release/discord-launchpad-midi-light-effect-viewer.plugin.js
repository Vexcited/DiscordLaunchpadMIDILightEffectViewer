/**
 * @name DiscordLaunchpadMIDILightEffectViewer
 * @author Mikkel "Vexcited" RINGAUD
 * @version 0.0.1
 * @description BetterDiscord plugin to visualize Launchpad light effects for .mid files in Discord
 * @website https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer
 */

'use strict';

var name = "discord-launchpad-midi-light-effect-viewer";
var className = "DiscordLaunchpadMIDILightEffectViewer";
var version = "0.0.1";
var description = "BetterDiscord plugin to visualize Launchpad light effects for .mid files in Discord";
var homepage = "https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer";
var scripts = {
	prebuild: "rimraf release",
	build: "rollup -c"
};
var author = {
	name: "Mikkel \"Vexcited\" RINGAUD",
	url: "https://github.com/Vexcited",
	email: "mikkel@milescode.dev"
};
var license = "MIT";
var devDependencies = {
	"@rollup/plugin-json": "^4.1.0",
	rimraf: "^3.0.2",
	rollup: "^2.77.2"
};
var pkg = {
	name: name,
	className: className,
	version: version,
	description: description,
	homepage: homepage,
	scripts: scripts,
	author: author,
	license: license,
	devDependencies: devDependencies
};

const fs$1 = window.require("fs");
const path = window.require("path");
const request = window.require("request");

const BDFDB_PLUGIN_URL = "https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js";
const isMissingLibrary = () => !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started);

const MissingLibraryLoader = class {
  getName () { return pkg.className; }
  getAuthor () { return pkg.author.name; }
  getVersion () { return pkg.version; }
  getDescription () {
    return `The Library Plugin needed for ${pkg.className} (BDFDB) is missing. Open the Plugin Settings to download it. \n\n${pkg.description}`;
  }
		
  downloadLibrary () {
    request.get(BDFDB_PLUGIN_URL, (e, r, b) => {
      if (!e && b && r.statusCode == 200) fs$1.writeFile(path.join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
      else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
    });
  }
		
  load () {
    if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue))
      window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
    
      if (!window.BDFDB_Global.downloadModal) {
      window.BDFDB_Global.downloadModal = true;
      BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${pkg.className} is missing. Please click "Download Now" to install it.`, {
        confirmText: "Download Now",
        onConfirm: () => {
          delete window.BDFDB_Global.downloadModal;
          this.downloadLibrary();
        },

        cancelText: "Cancel",
        onCancel: () => {
          delete window.BDFDB_Global.downloadModal;
        }
      });
    }
    if (!window.BDFDB_Global.pluginQueue.includes(pkg.className))
      window.BDFDB_Global.pluginQueue.push(pkg.className);
  }

	start () { this.load(); }
  stop () {}

  getSettingsPanel () {
    const template = document.createElement("template");
    template.innerHTML = `
      <p style="color: var(--header-primary);">
        The Library Plugin needed for ${pkg.className} is missing.\n
        Please click <a style="font-weight: 500;">Download Now</a> to install it.
      </p>
    `;

    template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
    return template.content.firstElementChild;
  }
};

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
const midiPermissionsInjected = () => {
  const appFileCode = getAppFileCode();
  return appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_");
};

const injectMidiPermissions = () => {
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

const loadWebMidi = () => {
  ipcRenderer.send("_WEBMIDI_LOAD_");
  return navigator.requestMIDIAccess({ sysex: true });
};

const config = {
  "info": {
    "name": pkg.className,
    "author": pkg.author.name,
    "version": pkg.version,
    "description": pkg.description
  }
};

var DiscordLaunchpadMIDILightEffectViewer = (([Plugin, BDFDB]) => {

  return class DiscordLaunchpadMIDILightEffectViewer extends Plugin {
    /** @type {MIDIAccess | undefined} */
    midiAccess;

    _setupUploadFilePatch () {
      console.log("setup");
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

            BdApi.showConfirmationModal("Detected a MIDI file !", "Do you want to share it as a light effect ?", {
              confirmText: "Yes !",
              onConfirm: () => {
                BDFDB.ModalUtils.open(this, {
                  header: "MIDI Light Effect Configuration",
                  subHeader: "",
                  className: BDFDB.disCN._repomodal,
                  headerClassName: BDFDB.disCN._repomodalheader,
                  contentClassName: BDFDB.disCN._repomodalsettings,
                  footerClassName: BDFDB.disCN._repomodalfooter,
                  size: "MEDIUM",
                  children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanel, { children: () => [
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
                      type: "TextInput",
                      margin: 8,
                      label: "my name here",
                      note: "a quick note",
                      basis: "70%",
                      name: "name",
                      value: "value",
                      oldValue: "old value",
                      defaultValue: "default value",
                      placeholder: "placeholder"
                    })
                  ] }),
                  buttons: [{
                    contents: "Send light effect !",
                    color: "BRAND",
                    onClick: () => console.log("save")
                  }, {
                    contents: "Keep it as a MIDI file",
                    look: "LINK",
                    onClick: () => console.log("cancel")
                  }]
                });
              },

              cancelText: "Nope",
              onCancel: () => undefined
            });
          } 

          // Call it with modified parameters
          e.originalMethod.apply(e.thisObject, [{
            files,
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

    async onStart () {
      if (midiPermissionsInjected()) {
        console.log("[WebMidiInjector] Already patched, skipping.");
      } else injectMidiPermissions();
  
      // Setup upload file patch.
      this._setupUploadFilePatch();
  
      // Load WebMIDI.
      this.midiAccess = await loadWebMidi();
    }

    onStop () {
      // Clean up all the patches.
      this.cleanFunctions.forEach(f => f());
    }

    /**
     * Functions to be called when
     * the plugin is disabled/stopped.
     */
    cleanFunctions = [];
  }
})(window.BDFDB_Global.PluginUtils.buildPlugin(config));

var index = (() => isMissingLibrary() ? MissingLibraryLoader : DiscordLaunchpadMIDILightEffectViewer)();

// /** @type {MIDIAccess | null} */
// const getOutputs = () => {
//   if (!_WEBMIDI_ACCESS_) return [];
//   /** @type {MIDIOutput[]} */
//   const outputs = [];

//   for (const entry of _WEBMIDI_ACCESS_.outputs) {
//     const output = entry[1];
//     outputs.push(output);
//   }

//   return outputs;
// }

module.exports = index;
