import pkg from "../../package.json";
import * as zip from "@zip.js/zip.js";
import launchpads, { LAUNCHPAD_REQUIRED_CSS } from "../launchpads";
import { devicesConfiguration } from "../utils/devices";

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
  const LaunchpadComponents = launchpads(BDFDB);

  return class DiscordLaunchpadMIDILightEffectViewer extends Plugin {
    /**
     * Functions to be called when
     * the plugin is disabled/stopped.
     */
    cleanFunctions = [];

    /** @type {MIDIAccess | undefined} */
    midiAccess;

    outputs () {
      /** @type {MIDIOutput[]} */
      const outputs = [];

      for (const entry of this.midiAccess.outputs) {
        const output = entry[1];
        outputs.push(output);
      }

      return outputs;
    }

    _setupUploadFilePatch () {
      console.log("setup");
      const addFilesModule = BdApi.findModuleByProps("addFiles");
      const cleanAddFilesPatch = BdApi.monkeyPatch(addFilesModule, "addFiles", {
        instead: ({ methodArguments, originalMethod, thisObject, callOriginalMethod }) => {
          const params = methodArguments[0];
          
          /** @type {{ file: File, platform: number }[]} */
          const files = params.files;
          const midiFiles = files.filter(({ file }) => file.name.endsWith(".mid"));
          const cleanedFiles = files.filter(({ file }) => !file.name.endsWith(".mid"));

          if (midiFiles.length > 0) {
            const midiFile = midiFiles[0];

            const originalMidiFileName = midiFile.file.name.replace(".mid", "");
            let midiFileName = originalMidiFileName;

            let midiLaunchpadType;

            let currentTab = "Configuration";

            BdApi.showConfirmationModal("Detected a MIDI file !", "Do you want to share it as a light effect ?", {
              confirmText: "Yes !",
              onConfirm: () => {
                BDFDB.ModalUtils.open(this, {
                  header: "MIDI Light Effect Configuration",
                  subHeader: "Here, you'll be able to fully configure the light effect that will be shared.",
                  size: "MEDIUM",
                  children: [
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
                      tab: "Configuration",
                      open: currentTab == "Configuration",
                      render: false,
                      children: [
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                          title: "Name of the Light Effect",
                          className: BDFDB.DiscordClassModules.Margins.marginTop8,
                          children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                            autoFocus: false,
                            disabled: false,
                            maxLength: 999,
                            onChange: (e) => (midiFileName = e),
                            placeholder: midiFileName,
                            size: "default",
                            type: "text",
                            value: midiFileName
                          })
                        }),
                        BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                          title: "Select the Launchpad type",
                          className: BDFDB.DiscordClassModules.Margins.marginTop20,
                          children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
                            onChange: (val) => (midiLaunchpadType = val),
                            options: Object.keys(devicesConfiguration).filter(device_key => device_key !== "launchpad_pro_mk2_cfw").map(device_key => ({
                              value: device_key,
                              label: devicesConfiguration[device_key].name
                            }))
                          })
                        })
                      ]
                    }),
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
                      tab: "Preview",
                      open: currentTab == "Preview",
                      render: false,
                      children: [
                        BDFDB.ReactUtils.createElement("div", {
                          style: {
                            height: "175px",
                            width: "175px",
                            margin: "0 auto",
                            padding: "8px",
                            background: "var(--background-tertiary)",
                            border: "1px solid var(--background-secondary)",
                            borderRadius: "6px"
                          },
                          children: BDFDB.ReactUtils.createElement(LaunchpadComponents.LaunchpadProMK2, {})
                        })
                      ]
                    })
                  ],
                  buttons: [{
                    contents: "Send light effect !",
                    color: "BRAND",
                    onClick: async () => {
                      BDFDB.LibraryModules.ModalUtils.closeAllModals();

                      const zipWriter = new zip.ZipWriter(
                        new zip.BlobWriter("application/zip"),
                        { bufferedWrite: true }
                      );

                      await zipWriter.add("effect.mid", new zip.BlobReader(midiFile.file));
                      await zipWriter.add("infos.json", new zip.TextReader(JSON.stringify({
                        name: midiFileName,
                        type: midiLaunchpadType
                      })));

                      const blob = await zipWriter.close();
                      const zip_file = new File([blob], midiFileName + ".dlpe.zip", { type: "application/zip" });
                      
                      const file = {
                        file: zip_file,
                        platform: 1
                      };

                      originalMethod.apply(thisObject, [{
                        ...params,
                        files: [file]
                      }]);
                    }
                  }, {
                    contents: "Keep it as a MIDI file",
                    look: "LINK",
                    onClick: () => {
                      BDFDB.LibraryModules.ModalUtils.closeAllModals();

                      // Call original method without any modification.
                      callOriginalMethod();
                    }
                  }]
                });
              },
              
              cancelText: "Nope",
              onCancel: callOriginalMethod
            });
          } else callOriginalMethod();
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
  
      // Inject required CSS for Launchpads.
      const INJECTED_CSS_ID = "DLE_LAUNCHPAD_INJECTED_CSS";
      BdApi.injectCSS(INJECTED_CSS_ID, LAUNCHPAD_REQUIRED_CSS);
      this.cleanFunctions.push(() => BdApi.clearCSS(INJECTED_CSS_ID));

      // Setup upload file patch.
      this._setupUploadFilePatch();
      
      // Load WebMIDI.
      this.midiAccess = await loadWebMidi();
      console.log(this.outputs());
    }

    onStop () {
      // Clean up all the patches.
      this.cleanFunctions.forEach(f => f());
    }
  }
})(window.BDFDB_Global.PluginUtils.buildPlugin(config));