import pkg from "../../package.json";

const https = window.require("https");
import Launchpad from "../launchpads";

import midiFileParser from "../utils/midiFileParser";
import { unbundleBuffer } from "../utils/bundle";
import { playMidiFile } from "../utils/player";

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
  
      res.on("end", () => {
        try {
          const binary = Buffer.concat(chunks);        
          const data = unbundleBuffer(binary);

          const infos_file = data.find(file => file.name === "infos.json");
          const midi_file = data.find(file => file.name === "effect.mid");
  
          if (!infos_file || !midi_file) {
            console.error(`[${pkg.className}] Invalid DLPE file: missing infos.json or effect.mid. Aborting.`);
            this.setState({ hasError: true });
            return;
          }
  
          const infos_parsed = JSON.parse(infos_file.content.toString());
          const midi_parsed = midiFileParser(midi_file.content);
  
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
          onClick: () => playMidiFile(this.launchpad_ref?.current, this.state.midi),
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