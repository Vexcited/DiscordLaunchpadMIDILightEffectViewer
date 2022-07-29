import pkg from "../../package.json";

import {
  injectMidiPermissions,
  midiPermissionsInjected,
  loadWebMidi
} from "../patchs/midi";

const config = {
  "info": {
    "name": pkg.className,
    "author": pkg.author.name,
    "version": pkg.version,
    "description": pkg.description
  }
};

export default (([Plugin, BDFDB]) => {

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
            const midiFile = midiFiles[0];

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
                      label: "Name",
                      note: "Name given to the light effect.",
                      basis: "100%",
                      name: "Name",
                      value: midiFile.file.name,
                      oldValue: midiFile.file.name,
                      defaultValue: midiFile.file.name,
                      placeholder: midiFile.file.name
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