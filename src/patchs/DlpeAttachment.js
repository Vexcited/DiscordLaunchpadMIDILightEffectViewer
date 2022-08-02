import pkg from "../../package.json";

const https = window.require("https");
import * as zip from "@zip.js/zip.js";
import Launchpad from "../launchpads";

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
          const binary = Buffer.concat(chunks);
          const uint8Array = new Uint8Array(binary);

          const reader = new zip.Uint8ArrayReader(uint8Array);
          const zipFile = new zip.ZipReader(reader);
          const entries = await zipFile.getEntries();
          
          const infos_file = entries.find(entry => entry.filename === "infos.json");
          const midi_file = entries.find(entry => entry.filename === "effect.mid");

          if (!infos_file || !midi_file) {
            console.error(`[${pkg.className}] Invalid DLPE file: missing infos.json or effect.mid. Aborting.`);
            this.setState({ hasError: true });
            return;
          }

          const infos = JSON.parse(await infos_file.getData(new zip.TextWriter()));
          const midi = await midi_file.getData(new zip.Uint8ArrayWriter());

          this.setState({ loaded: true, midi, infos });
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
            ref: this.launchpad_ref
          })
        }),
        BDFDB.ReactUtils.createElement("button", {
          onClick: () => {
            console.log(this.launchpad_ref, this.state);
          },
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