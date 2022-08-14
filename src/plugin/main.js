import pkg from "../../package.json";
import Launchpad, { LAUNCHPAD_REQUIRED_CSS } from "../launchpads";

import { devicesConfiguration } from "../utils/devices";
import DlpeAttachment from "../patchs/DlpeAttachment";

import { WebMidi } from "webmidi";

import {
  removeMidiPermissions,
  injectMidiPermissions,
  checkMidiPermissionsInjector
} from "../patchs/midi";

const { ipcRenderer } = window.require("electron");

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
            let launchpadType = Object.keys(devicesConfiguration)[0];
            
            const launchpadRef = BDFDB.ReactUtils.createRef();

            class UploadModalConfiguration extends BdApi.React.Component {
              render () {
                return BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
                  children: [
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                      title: "Name of the Light Effect",
                      className: BDFDB.DiscordClassModules.Margins.marginTop8,
                      children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
                        autoFocus: false,
                        disabled: false,
                        maxLength: 999,
                        onChange: (val) => {
                          midiFileName = val;
                        },
                        placeholder: originalMidiFileName,
                        size: "default",
                        type: "text",
                        value: midiFileName
                      })
                    }),
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
                      title: "Select the Launchpad type",
                      className: BDFDB.DiscordClassModules.Margins.marginTop20,
                      children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
                        value: launchpadType,
                        onChange: (val) => {
                          launchpadType = val;
                        },
                        options: Object.keys(devicesConfiguration)
                          .filter(device_key => device_key !== "launchpad_pro_mk2_cfw")
                          .map(device_key => ({
                            value: device_key,
                            label: devicesConfiguration[device_key].name
                          }))
                      })
                    })
                  ]
                });
              }
            }

            class UploadModalPreview extends BdApi.React.Component {
              lp_type = () => launchpadType;

              render () {
                return BDFDB.ReactUtils.createElement(BDFDB.ReactUtils.Fragment, {
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
                      children: BDFDB.ReactUtils.createElement(Launchpad, {
                        type: this.lp_type(),
                        ref: launchpadRef
                      })
                    })
                  ]
                })
              }
            }

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
                      open: true,
                      render: false,
                      children: BDFDB.ReactUtils.createElement(UploadModalConfiguration)
                    }),
                    BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
                      tab: "Preview",
                      render: false,
                      open: false,
                      children: BDFDB.ReactUtils.createElement(UploadModalPreview)
                    })
                  ],
                  buttons: [{
                    contents: "Send light effect !",
                    color: "BRAND",
                    onClick: async () => {
                      BDFDB.LibraryModules.ModalUtils.closeAllModals();

                      const zip = new JSZip();
                      zip.file("effect.mid", midiFile.file);
                      zip.file("infos.json", JSON.stringify({
                        name: midiFileName,
                        type: launchpadType
                      }, null, 2));

                      const blob = await zip.generateAsync({ type: "uint8array" });
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
    }

    _setupAttachmentPatch () {
      const AttachmentModule = BdApi.findModule(
        (m) => m.default?.displayName === "Attachment"
      );

      const cleanAttachmentPatch = BdApi.monkeyPatch(AttachmentModule, "default", {
        after: ({ returnValue }) => {
          if (
            returnValue.props?.children?.length === 0 ||
            !returnValue.props.children[0]?.props?.children.length === 0 ||
            !returnValue.props.children[0]?.props?.children[2]?.props.href
          ) return;

          const fileUrl = returnValue.props.children[0]?.props?.children[2]?.props.href;
          if (!fileUrl.toLowerCase().endsWith(".dlpe.zip")) return;

          const originalChildren = [...returnValue.props.children];
          returnValue.props.children[0].props.children = [
            BDFDB.ReactUtils.createElement(DlpeAttachment, {
              url: fileUrl,
              originalChildren
            })
          ];
        }
      });

      this.cleanFunctions.push(cleanAttachmentPatch);
    }

    async onStart () {
      const isMidiInjectedResponse = checkMidiPermissionsInjector(); 
      if (isMidiInjectedResponse === "patched") {
        console.log("[WebMidiInjector] Already patched, skipping.");
      }
      else if (isMidiInjectedResponse === "unpatched") {
        injectMidiPermissions();
      }
      else if (isMidiInjectedResponse === "outdated") {
        removeMidiPermissions();
        injectMidiPermissions();
      }
  
      // Inject required CSS for Launchpads.
      const INJECTED_CSS_ID = "DLE_LAUNCHPAD_INJECTED_CSS";
      BdApi.injectCSS(INJECTED_CSS_ID, LAUNCHPAD_REQUIRED_CSS);
      this.cleanFunctions.push(() => BdApi.clearCSS(INJECTED_CSS_ID));

      // Quick fix to inject JS libraries and defined them globally instead of AMD.
      const old_define = window.define;
      window.define = undefined;
      
      // Inject MIDI JS library.
      const INJECTED_JS_MIDI_ID = "DLE_LAUNCHPAD_INJECTED_MIDI_JS";
      await BdApi.linkJS(INJECTED_JS_MIDI_ID, "https://unpkg.com/@tonejs/midi");
      this.cleanFunctions.push(() => BdApi.unlinkJS(INJECTED_JS_MIDI_ID));
      
      // Inject ZIP JS library.
      const INJECTED_JS_ZIP_ID = "DLE_LAUNCHPAD_INJECTED_ZIP_JS";
      await BdApi.linkJS(INJECTED_JS_ZIP_ID, "https://unpkg.com/jszip@latest/dist/jszip.min.js");
      this.cleanFunctions.push(() => BdApi.unlinkJS(INJECTED_JS_ZIP_ID));

      // Re-define the define function.
      window.define = old_define;

      // Setup upload file patch.
      this._setupUploadFilePatch();
      this._setupAttachmentPatch();
      
      // Load WebMIDI.
      ipcRenderer.send("_WEBMIDI_LOAD_");
      await WebMidi.enable({ sysex: true });
    }

    onStop () {
      // Clean up all the patches.
      this.cleanFunctions.forEach(f => f());
    }

    getSettingsPanel () {
      return BDFDB.PluginUtils.createSettingsPanel(this, {
        children: () => {
          let settingsItems = [];

          settingsItems.push(
            BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
              title: "Select your device output",
              children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
                onChange: (val) => {
                  BDFDB.DataUtils.save(val, config.info.name, "output");
                },
                options: WebMidi.outputs.map(output => ({
                  value: output.id,
                  label: output.name
                }))
              })
            })
          );

          settingsItems.push(
            BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
              title: "Select your device type",
              className: BDFDB.DiscordClassModules.Margins.marginTop20,
              children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
                onChange: (val) => {
                  BDFDB.DataUtils.save(val, config.info.name, "type");
                },
                options: Object.keys(devicesConfiguration)
                  .map(device_key => ({
                    value: device_key,
                    label: devicesConfiguration[device_key].name
                  }))
              })
            })
          );

          return settingsItems;
        }
      });
    }
  }
})(window.BDFDB_Global.PluginUtils.buildPlugin(config));