import pkg from "../../package.json";
import { WebMidi } from "webmidi";

import { devicesConfiguration } from "../utils/devices";
import { DEFAULT_RGB_UI_PAD } from "../utils/palettes";

const deviceOutput = () => {
  const loaded_id = BDFDB.DataUtils.load(pkg.className, "output");
  const loaded_type = BDFDB.DataUtils.load(pkg.className, "type");

  if (typeof loaded_id === "string" && typeof loaded_type === "string") return {
    output: WebMidi.outputs.find(output => output.id === loaded_id),
    type: loaded_type
  }

  return null;
}

/**
 * @param {HTMLElement} launchpad
 * @param {any[]} midi
 */
export const playMidiFile = async (launchpad, midi) => {
  if (!launchpad || !midi) return;

  const device = deviceOutput();
  const device_configuration = device ? devicesConfiguration[device.type] : null;

  const playTimeStart = performance.now();
  let currentLedsState = {};
  console.log(midi);

  for (const group of midi.notes) {
    const groupStartTime = group.start_time;
    if (groupStartTime < performance.now() - playTimeStart) continue;

    if (device.output) {
      const leds = group.notes.map(note => ({
        note: note.index,
        color: note.color
      }));

      const sysex = device_configuration.rgb_sysex(leds);
      device.output.sendSysex([], sysex);
    }

    let toWait = groupStartTime - (performance.now() - playTimeStart);
    await new Promise(r => setTimeout(r, toWait));

    for (const note of group.notes) {
      // Get the pad element from the Launchpad.
      const pad = launchpad.querySelector(`[data-note="${note.index}"]`);
      if (!pad) continue;
      
      const colored_pad_style = `rgb(${note.uiColor.join(", ")})`;

      // Set the color of the pad for the `noteon`.
      pad.style.backgroundColor = colored_pad_style;

      // Setup the timing for the `noteoff`.
      setTimeout(() => {
        const current_style = pad.style.backgroundColor;
        if (!current_style) return;

        /**
         * Check if the pad haven't been triggered.
         * If triggered with another color, then we do nothing
         * and let the other trigger, handle everything.
         * If it's still the same color, we remove it.
         */
        if (current_style === colored_pad_style) {
          // Remove the color of the pad for the `noteoff`.
          pad.style.backgroundColor = `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`;

          if (device.output) {
            const sysex = device_configuration.rgb_sysex([{
              note: note.index, color: [0, 0, 0]
            }]);
            device.output.sendSysex([], sysex);
          }
        } 
      }, note.duration);
    }
  }
}