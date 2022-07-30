import {
  isMissingLibrary,
  MissingLibraryLoader
} from "./utils/missingLibraryModal";

import DiscordLaunchpadMIDILightEffectViewer from "./plugin/main";

export default (() => isMissingLibrary() ? MissingLibraryLoader : DiscordLaunchpadMIDILightEffectViewer)();

