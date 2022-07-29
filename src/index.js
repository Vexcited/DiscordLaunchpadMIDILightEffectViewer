import {
  isMissingLibrary,
  MissingLibraryLoader
} from "./utils/missingLibraryModal";

import DiscordLaunchpadMIDILightEffectViewer from "./plugin/main";

export default (() => isMissingLibrary() ? MissingLibraryLoader : DiscordLaunchpadMIDILightEffectViewer)();

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

