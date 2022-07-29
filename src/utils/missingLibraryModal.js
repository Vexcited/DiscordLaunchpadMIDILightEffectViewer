import pkg from "../../package.json";

const fs = window.require("fs");
const path = window.require("path");
const request = window.require("request");

const BDFDB_PLUGIN_URL = "https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js";
export const isMissingLibrary = () => !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started);

export const MissingLibraryLoader = class {
  getName () { return pkg.className; }
  getAuthor () { return pkg.author.name; }
  getVersion () { return pkg.version; }
  getDescription () {
    return `The Library Plugin needed for ${pkg.className} (BDFDB) is missing. Open the Plugin Settings to download it. \n\n${pkg.description}`;
  }
		
  downloadLibrary () {
    request.get(BDFDB_PLUGIN_URL, (e, r, b) => {
      if (!e && b && r.statusCode == 200) fs.writeFile(path.join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
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
