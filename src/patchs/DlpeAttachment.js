import { WebMidi } from "webmidi";
import pkg from "../../package.json";

const https = window.require("https");
import Launchpad from "../launchpads";

import midiFileParser from "../utils/midiFileParser";
import { devicesConfiguration } from "../utils/devices";
import { DEFAULT_RGB_UI_PAD } from "../utils/palettes";

import { unbundleBuffer } from "../utils/bundler";

class DlpeAttachment extends BdApi.React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      loaded: false,
      infos: null,
      midi: null
    };

    this.launchpad_ref = BDFDB.ReactUtils.createRef();
  }

  componentDidMount () {
    const url = new URL(this.props.url);

    https.get({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: "GET"
    }, (res) => {
      res.setEncoding("binary");
      const chunks = [];
  
      res.on("data", (chunk) => {
          chunks.push(Buffer.from(chunk, "binary"));
      });
  
      res.on("end", async () => {
        try {
          const binary = Buffer.concat(chunks);        
          const data = unbundleBuffer(binary);

          const { "infos.json": infos_file, "effect.mid": midi_file } = data;

          if (!infos_file || !midi_file) {
            console.error(`[${pkg.className}] Invalid DLPE file: missing infos.json or effect.mid. Aborting.`);
            this.setState({ hasError: true });
            return;
          }
  
          const infos_parsed = JSON.parse(infos_file.toString());
          const midi_parsed = await midiFileParser(midi_file);
  
          this.setState({ loaded: true, midi: midi_parsed, infos: infos_parsed });
        }
        catch (e) {
          console.error(`[${pkg.className}] Error while parsing DLPE file: ${e.message}`);
          this.setState({ hasError: true });
        }
      });
    });
  }

  render () {
    if (this.state.hasError) return this.props.originalChildren;
    const deviceOutput = () => {
      const loaded_id = BDFDB.DataUtils.load(pkg.className, "output");
      const loaded_type = BDFDB.DataUtils.load(pkg.className, "type");

      if (typeof loaded_id === "string" && typeof loaded_type === "string") return {
        output: WebMidi.outputs.find(output => output.id === loaded_id),
        type: loaded_type
      }

      return null;
    }

    const playMidiFile = async () => {
      const launchpad = this.launchpad_ref?.current;
      const midi = this.state.midi;
      if (!launchpad || !midi) return;

      const device = deviceOutput();
      const device_configuration = device ? devicesConfiguration[device.type] : null;

      const playTimeStart = performance.now();
      for (const group of midi) {
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

    return this.state.loaded
    ? BDFDB.ReactUtils.createElement("div", {
      children: [
        BDFDB.ReactUtils.createElement("p", {
          style: {
            color: "var(--text-normal)",
            margin: "0 0 6px 0",
            fontWeight: "500",
            textAlign: "center"
          },
          children: this.state.infos.name
        }),
        BDFDB.ReactUtils.createElement("div", {
          style: {
            width: "150px",
            padding: "8px",
            margin: "0 auto",
            background: "var(--background-tertiary)",
            border: "1px solid var(--background-secondary)",
            borderRadius: "6px"
          },
          children: BDFDB.ReactUtils.createElement(Launchpad, {
            type: this.state.infos.type,
            innerRef: this.launchpad_ref
          })
        }),
        BDFDB.ReactUtils.createElement("button", {
          onClick: playMidiFile,
          children: "Play"
        })
      ]
    })
    : BDFDB.ReactUtils.createElement("p", {
      children: "Loading..."
    });
  }
}

export default DlpeAttachment;