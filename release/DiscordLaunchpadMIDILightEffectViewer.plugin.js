/**
 * @name DiscordLaunchpadMIDILightEffectViewer
 * @author Mikkel "Vexcited" RINGAUD
 * @version 0.0.1
 * @description BetterDiscord plugin to visualize Launchpad light effects for .mid files in Discord
 * @website https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer
 */

'use strict';

var name = "discord-launchpad-midi-light-effect-viewer";
var className = "DiscordLaunchpadMIDILightEffectViewer";
var version = "0.0.1";
var description = "BetterDiscord plugin to visualize Launchpad light effects for .mid files in Discord";
var homepage = "https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer";
var scripts = {
	build: "rimraf release && rollup -c"
};
var author = {
	name: "Mikkel \"Vexcited\" RINGAUD",
	url: "https://github.com/Vexcited",
	email: "mikkel@milescode.dev"
};
var license = "MIT";
var devDependencies = {
	"@rollup/plugin-commonjs": "^22.0.1",
	"@rollup/plugin-json": "^4.1.0",
	"@rollup/plugin-node-resolve": "^13.3.0",
	rimraf: "^3.0.2",
	rollup: "^2.77.2"
};
var dependencies = {
	webmidi: "^3.0.21"
};
var pkg = {
	name: name,
	className: className,
	version: version,
	description: description,
	homepage: homepage,
	scripts: scripts,
	author: author,
	license: license,
	devDependencies: devDependencies,
	dependencies: dependencies
};

const fs$1 = window.require("fs");
const path = window.require("path");
const request = window.require("request");

const BDFDB_PLUGIN_URL = "https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js";
const isMissingLibrary = () => !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started);

const MissingLibraryLoader = class {
  getName () { return pkg.className; }
  getAuthor () { return pkg.author.name; }
  getVersion () { return pkg.version; }
  getDescription () {
    return `The Library Plugin needed for ${pkg.className} (BDFDB) is missing. Open the Plugin Settings to download it. \n\n${pkg.description}`;
  }
		
  downloadLibrary () {
    request.get(BDFDB_PLUGIN_URL, (e, r, b) => {
      if (!e && b && r.statusCode == 200) fs$1.writeFile(path.join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
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

/**
 * Most of the code right here is taken from
 * Vexcited's lpadder project.
 * 
 * You can see the original code here:
 * <https://github.com/Vexcited/lpadder/blob/main/src/utils/devices.ts>
 */

/** Private function to build the `drum_rack` layout. */
const buildDrumRackLayout = () => {
  let layout = [];

  for (let columns = 64; columns >= 36; columns -= 4) {
    const column = [];

    for (let rows = 0; rows <= 7; rows++) {
      let pad = columns + rows;

      // After the 4 pads it goes to the next "side" (+32) and gets back to 0 (-4)
      if (rows >= 4) {
        pad += 32 - 4;
      }

      // Insert the pad to the column.
      column.push(pad);
    }

    // Insert the column to the layout.
    layout.push(column);
  }

  // Build the controls.
  layout = layout.map((row, row_index) => {
    return [
      // Right column goes from 108 to 115 (top to bottom).
      108 + row_index,
      ...row,
      // Left column goes from 100 to 107 (top to bottom).
      100 + row_index];
  });

  /** The top row goes from 28 to 35. */
  const top_row = Array.from({ length: 8 }, (_, id) => id + 28);
  /** The bottom row goes from 116 to 123. */
  const bottom_row = Array.from({ length: 8 }, (_, id) => id + 116);

  return [
    [-1, ...top_row, -1],
    ...layout,
    [-1, ...bottom_row, -1]
  ];
};

/**  Private function to build the full `programmer` layout. */
const buildProgrammerLayout = () => {
  let layout = [];

  // Build the grid.
  for (let columns = 8; columns >= 1; columns--) {
    const column = [];

    for (let rows = 1; rows <= 8; rows++) {
      const id = `${columns}${rows}`;
      column.push(parseInt(id));
    }

    layout.push(column);
  }

  // Build the controls.
  layout = layout.map((row, row_index) => {
    return [
      // Right column goes from 80 to 10 (top to bottom).
      80 - 10 * row_index,
      ...row,
      // Left column goes from 89 to 19 (top to bottom).
      89 - 10 * row_index];
  });

  /** The top row goes from 91 to 98. */
  const top_row = Array.from({ length: 8 }, (_, id) => id + 91);
  /** The bottom row goes from 1 to 8. */
  const bottom_row = Array.from({ length: 8 }, (_, id) => id + 1);

  return [
    [-1, ...top_row, -1],
    ...layout,
    [-1, ...bottom_row, -1]
  ];
};

const layouts = {
  drum_rack: buildDrumRackLayout(),
  programmer: buildProgrammerLayout()
};

/**
 * Converts a note from layout A to layout B.
 * @param {number} note - The note to convert.
 * @param {keyof (typeof layouts)} from - The layout to convert from.
 * @param {keyof (typeof layouts)} to - The layout to convert to.
 * @returns {{ success: true, note: number } | { success: false }}
 */
const convertNoteLayout = (note, from, to) => {
  // Search in the `from` layout the note.
  for (const [index_col, columns] of layouts[from].entries()) {
    const index = columns.indexOf(note);

    if (index !== -1) {
      return {
        success: true,
        note: layouts[to][index_col][index]
      };
    }
  }

  return { success: false };
};

/**
 * Most of the code right here is taken from
 * Vexcited's lpadder project.
 * 
 * You can see the original code here:
 * <https://github.com/Vexcited/lpadder/blob/main/src/utils/devices.ts>
 */

/** SysEx header for Novation devices. */
const SYSEX_HEADER_NOVATION = [0x00, 0x20, 0x29];

const devicesConfiguration = {
  launchpad_pro_mk2: {
    name: "Launchpad Pro MK2",

    initialization_sysex: [
      // Enter "Live" mode.
      [...SYSEX_HEADER_NOVATION, 2, 16, 33, 0],
      // Clear canvas.
      [...SYSEX_HEADER_NOVATION, 2, 16, 14, 0],
      // Clear "mode" light.
      [...SYSEX_HEADER_NOVATION, 2, 16, 10, 99, 0]
    ],

    rgb_sysex: (leds) => [
      ...SYSEX_HEADER_NOVATION, 2, 16, 11,
      ...leds.map(led => [led.note, led.color[0] >> 2, led.color[1] >> 2, led.color[2] >> 2]).flat()
    ],

    layout_to_use: layouts["programmer"]
  },

  get launchpad_pro_mk2_cfw () {
    return {
      ...this.launchpad_pro_mk2,
      name: "Launchpad Pro MK2 (CFW)",
      initialization_sysex: [
        // Enter "Performance" mode.
        [...SYSEX_HEADER_NOVATION, 2, 16, 33, 1],
        // Clear canvas.
        [...SYSEX_HEADER_NOVATION, 2, 16, 14, 0],
        // Clear "mode" light.
        [...SYSEX_HEADER_NOVATION, 2, 16, 10, 99, 0]
      ]
    };
  },

  launchpad_x: {
    name: "Launchpad X",

    initialization_sysex: [
      // Enter "Programmer" mode.
      [...SYSEX_HEADER_NOVATION, 2, 12, 14, 1]
    ],

    rgb_sysex: (leds) => [
      ...SYSEX_HEADER_NOVATION, 2, 12, 3, 3,
      ...leds.map(led => [led.note, led.color[0] >> 1, led.color[1] >> 1, led.color[2] >> 1]).flat()
    ],

    get layout_to_use () {
      let layout = [...layouts["programmer"]];

      layout = layout.map((row, rowIndex) => {
        // Remove the first item, since we don't have left column.
        const new_row = [...row];
        new_row.shift();

        // Add the `99` pad on the last item in the first row (0)
        if (rowIndex === 0) new_row[new_row.length - 1] = 99;
        return new_row;
      });

      // Remove the last row since we don't have the bottom row.
      layout.pop();

      return layout;
    }
  },

  launchpad_pro_mk3: {
    name: "Launchpad Pro MK3",

    initialization_sysex: [
      // Enter "Programmer" mode.
      [...SYSEX_HEADER_NOVATION, 2, 14, 14, 1]
    ],

    rgb_sysex: (leds) => [
      ...SYSEX_HEADER_NOVATION, 2, 14, 3, 3,
      ...leds.map(led => [led.note, led.color[0] >> 1, led.color[1] >> 1, led.color[2] >> 1]).flat()
    ],

    get layout_to_use () {
      let layout = [...layouts["programmer"]];

      layout = layout.map((row, rowIndex) => {
        const new_row = [...row];

        if (rowIndex === 0) {
          // Add the `99` pad on the last item of the first row (0)
          new_row[new_row.length - 1] = 99;

          // Also add the `90` pad on the first item of the first row (0)
          new_row[0] = 90;
        }

        return new_row;
      });

      const bottom_additional_row = Array.from({ length: 8 }, (_, id) => id + 101);

      const last_row = layout.pop();
      layout.push([-1, ...bottom_additional_row, -1]);
      layout.push(last_row);

      return layout;
    }
  },

  launchpad_mk2: {
    name: "Launchpad MK2",
    initialization_sysex: [],

    rgb_sysex: (leds) => [
      ...SYSEX_HEADER_NOVATION, 2, 24, 11,
      ...leds.map(led => [led.note, led.color[0] >> 2, led.color[1] >> 2, led.color[2] >> 2]).flat()
    ],

    get layout_to_use () {
      let layout = [...layouts["programmer"]];

      layout = layout.map(row => {
        // Remove the first item, since we don't have left column.
        const new_row = [...row];
        new_row.shift();

        return new_row;
      });

      // Remove the last row since we don't have the bottom row.
      layout.pop();

      return layout;
    }
  },

  get launchpad_mini_mk3 () {
    return {
      ...this.launchpad_x,
      name: "Launchpad Mini MK3",

      initialization_sysex: [
        // Enter "Programmer" mode.
        [...SYSEX_HEADER_NOVATION, 2, 13, 14, 1]
      ],

      rgb_sysex: (leds) => [
        ...SYSEX_HEADER_NOVATION, 2, 13, 3, 3,
        ...leds.map(led => [led.note, led.color[0] >> 1, led.color[1] >> 1, led.color[2] >> 1]).flat()
      ]
    };
  }
};

/** This is the color used by the UI on pads. */
const DEFAULT_RGB_UI_PAD = [148, 163, 184];

/**
 * Default RGB palette from Novation on Launchpads.
 * Starts from velocity 0 to 127.
 * 
 * Taken from <https://github.com/Vexcited/lpadder/blob/main/src/utils/palettes.ts>.
 */
const novationLaunchpadPalette = [
  [0, 0, 0],
  [28, 28, 28],
  [124, 124, 124],
  [252, 252, 252],
  [252, 72, 72],
  [252, 0, 0],
  [84, 0, 0],
  [24, 0, 0],
  [252, 184, 104],
  [252, 80, 0],
  [84, 28, 0],
  [36, 24, 0],
  [252, 252, 72],
  [252, 252, 0],
  [84, 84, 0],
  [24, 24, 0],
  [132, 252, 72],
  [80, 252, 0],
  [28, 84, 0],
  [16, 40, 0],
  [72, 252, 72],
  [0, 252, 0],
  [0, 84, 0],
  [0, 24, 0],
  [72, 252, 92],
  [0, 252, 24],
  [0, 84, 12],
  [0, 24, 0],
  [72, 252, 132],
  [0, 252, 84],
  [0, 84, 28],
  [0, 28, 16],
  [72, 252, 180],
  [0, 252, 148],
  [0, 84, 52],
  [0, 24, 16],
  [72, 192, 252],
  [0, 164, 252],
  [0, 64, 80],
  [0, 12, 24],
  [72, 132, 252],
  [0, 84, 252],
  [0, 28, 84],
  [0, 4, 24],
  [72, 72, 252],
  [0, 0, 252],
  [0, 0, 84],
  [0, 0, 24],
  [132, 72, 252],
  [80, 0, 252],
  [24, 0, 96],
  [12, 0, 44],
  [252, 72, 252],
  [252, 0, 252],
  [84, 0, 84],
  [24, 0, 24],
  [252, 72, 132],
  [252, 0, 80],
  [84, 0, 28],
  [32, 0, 16],
  [252, 20, 0],
  [148, 52, 0],
  [116, 80, 0],
  [64, 96, 0],
  [0, 56, 0],
  [0, 84, 52],
  [0, 80, 124],
  [0, 0, 252],
  [0, 68, 76],
  [36, 0, 200],
  [124, 124, 124],
  [28, 28, 28],
  [252, 0, 0],
  [184, 252, 44],
  [172, 232, 4],
  [96, 252, 8],
  [12, 136, 0],
  [0, 252, 132],
  [0, 164, 252],
  [0, 40, 252],
  [60, 0, 252],
  [120, 0, 252],
  [172, 24, 120],
  [60, 32, 0],
  [252, 72, 0],
  [132, 220, 4],
  [112, 252, 20],
  [0, 252, 0],
  [56, 252, 36],
  [84, 252, 108],
  [52, 252, 200],
  [88, 136, 252],
  [48, 80, 192],
  [132, 124, 228],
  [208, 28, 252],
  [252, 0, 88],
  [252, 124, 0],
  [180, 172, 0],
  [140, 252, 0],
  [128, 88, 4],
  [56, 40, 0],
  [16, 72, 12],
  [12, 76, 52],
  [20, 20, 40],
  [20, 28, 88],
  [100, 56, 24],
  [164, 0, 8],
  [216, 80, 60],
  [212, 104, 24],
  [252, 220, 36],
  [156, 220, 44],
  [100, 176, 12],
  [28, 28, 44],
  [216, 252, 104],
  [124, 252, 184],
  [152, 148, 252],
  [140, 100, 252],
  [60, 60, 60],
  [112, 112, 112],
  [220, 252, 252],
  [156, 0, 0],
  [52, 0, 0],
  [24, 204, 0],
  [4, 64, 0],
  [180, 172, 0],
  [60, 48, 0],
  [176, 92, 0],
  [72, 20, 0]
];

class LaunchpadProMK2 extends BdApi.React.Component {
  render () {
    return (
      BDFDB.ReactUtils.createElement("div", {
        ref: this.props.innerRef,
        style: { display: "flex", flexDirection: "column", gap: "3px" },
        children: devicesConfiguration.launchpad_pro_mk2.layout_to_use.map((row, row_index) => (
          BDFDB.ReactUtils.createElement("div", {
            key: row_index,
            style: { display: "flex", flexDirection: "row", gap: "3px" },
            children: row.map(noteId => {
              const isControlButton = (
                row_index === 0
                || row_index === 9
                || noteId.toString()[1] === "0"
                || noteId.toString()[1] === "9"
              );

              return (noteId !== -1)
                ? BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  "data-note": noteId,
                  className: isControlButton ? "__dle_launchpad_phantom_pad __dle_launchpad_phantom_pad_circle" : "",
                  style: {
                    width: "100%",
                    height: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: isControlButton ? "50%" : "2px",
                    backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`
                  }
                })
              
                : BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  style: {
                    width: "100%",
                    height: "100%",
                  }
                })
              }
            )
          })
        ))
      })
    )
  }
}


var LaunchpadProMK2$1 = BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadProMK2, {
  innerRef: ref,
  ...props 
}));

class LaunchpadMK2 extends BdApi.React.Component {
  render () {
    return (
      BDFDB.ReactUtils.createElement("div", {
        ref: this.props.innerRef,
        style: { display: "flex", flexDirection: "column", gap: "3px" },
        children: devicesConfiguration.launchpad_mk2.layout_to_use.map((row, row_index) => (
          BDFDB.ReactUtils.createElement("div", {
            key: row_index,
            style: { display: "flex", flexDirection: "row", gap: "3px" },
            children: row.map(noteId => {
              const isControlButton = (
                row_index === 0
                || noteId.toString()[1] === "9"
              );

              return (noteId !== -1)
                ? BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  "data-note": noteId,
                  className: isControlButton ? "__dle_launchpad_phantom_pad __dle_launchpad_phantom_pad_circle" : "",
                  style: {
                    width: "100%",
                    height: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: isControlButton ? "50%" : "2px",
                    backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`
                  }
                })
              
                : BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  style: {
                    width: "100%",
                    height: "100%",
                  }
                })
              }
            )
          })
        ))
      })
    )
  }
}

var LaunchpadMK2$1 = BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadMK2, {
  innerRef: ref,
  ...props 
}));

class LaunchpadProMK3 extends BdApi.React.Component {
  render () {
    return (
      BDFDB.ReactUtils.createElement("div", {
        ref: this.props.innerRef,
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "1.5px",
        },
        children: devicesConfiguration.launchpad_pro_mk3.layout_to_use.map((row, row_index) => (
          BDFDB.ReactUtils.createElement("div", {
            key: row_index,
            style: {
              display: "flex",
              flexDirection: "row",
              gap: "3px",
              marginBottom: !(row_index === 9 || row_index === 10) ? "1.5px" : "0px"
            },
            children: row.map(noteId => {
              const isControlButton = (
                row_index === 0
                || (noteId.toString()[1] === "0" && noteId <= 100)
                || noteId.toString()[1] === "9"
              );

              const isBottomControlButton = (row_index === 9 || row_index === 10);

              return (noteId !== -1 && noteId !== 99)
                ? BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  "data-note": noteId,
                  className: isControlButton ? "__dle_launchpad_phantom_pad __dle_launchpad_phantom_pad_regular" : isBottomControlButton ? "__dle_launchpad_phantom_pad" : "",
                  style: {
                    width: "100%",
                    height: "100%",
                    aspectRatio: !isBottomControlButton ? "1 / 1" : "2 / 1",
                    borderRadius: "2px",
                    backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`,
                    transform: noteId === 90 ? "scale(0.5)" : ""
                  }
                })
              
                : (noteId === 99)
                  ? BDFDB.ReactUtils.createElement("div", {
                    key: noteId,
                    "data-note": noteId,
                    style: {
                      width: "100%",
                      height: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "2px",
                      transform: "scale(0.75)",
                      backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`
                    }
                  })
                  : BDFDB.ReactUtils.createElement("div", {
                    key: noteId,
                    style: {
                      width: "100%",
                      height: "100%"
                    }
                  })
              }
            )
          })
        ))
      })
    )
  }
}


var LaunchpadProMK3$1 = BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadProMK3, {
  innerRef: ref,
  ...props 
}));

class LaunchpadXandMiniMK3 extends BdApi.React.Component {
  render () {
    return (
      BDFDB.ReactUtils.createElement("div", {
        ref: this.props.innerRef,
        style: { display: "flex", flexDirection: "column", gap: "3px" },
        children: devicesConfiguration.launchpad_x.layout_to_use.map((row, row_index) => (
          BDFDB.ReactUtils.createElement("div", {
            key: row_index,
            style: { display: "flex", flexDirection: "row", gap: "3px" },
            children: row.map(noteId => {
              const isControlButton = (
                row_index === 0
                || noteId.toString()[1] === "9"
              );

              return (noteId !== -1 && noteId !== 99)
                ? BDFDB.ReactUtils.createElement("div", {
                  key: noteId,
                  "data-note": noteId,
                  className: isControlButton ? "__dle_launchpad_phantom_pad __dle_launchpad_phantom_pad_regular" : "",
                  style: {
                    width: "100%",
                    height: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: "2px",
                    backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`
                  }
                })
                : (noteId === 99)
                  ? BDFDB.ReactUtils.createElement("div", {
                    key: noteId,
                    "data-note": noteId,
                    style: {
                      width: "100%",
                      height: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "2px",
                      transform: "scale(0.75)",
                      backgroundColor: `rgb(${DEFAULT_RGB_UI_PAD.join(", ")})`
                    }
                  })
                  : BDFDB.ReactUtils.createElement("div", {
                    key: noteId,
                    style: {
                      width: "100%",
                      height: "100%"
                    }
                  })
              }
            )
          })
        ))
      })
    )
  }
}

var LaunchpadXandMiniMK3$1 = BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadXandMiniMK3, {
  innerRef: ref,
  ...props 
}));

const LAUNCHPAD_REQUIRED_CSS = `
  .__dle_launchpad_phantom_pad:after {
    display: block;
    box-sizing: border-box;
    height: 100%;
    width: 100%;

    background-clip: content-box;
    background-color: var(--background-tertiary);
  
    content: "";
    padding: 2px;
  }

  .__dle_launchpad_phantom_pad_circle:after {
    border-radius: 50%;
  }

  .__dle_launchpad_phantom_pad_regular:after {
    border-radius: 2px;
  }
`;

class Launchpad extends BdApi.React.Component {
  render () {
    switch (this.props.type) {
      case "launchpad_pro_mk2":
      case "launchpad_pro_mk2_cfw":
        return BDFDB.ReactUtils.createElement(LaunchpadProMK2$1, {
          ref: this.props.innerRef
        });
      case "launchpad_mk2":
        return BDFDB.ReactUtils.createElement(LaunchpadMK2$1, {
          ref: this.props.innerRef
        });
      case "launchpad_x":
      case "launchpad_mini_mk3":
        return BDFDB.ReactUtils.createElement(LaunchpadXandMiniMK3$1, {
          ref: this.props.innerRef
        });
      case "launchpad_pro_mk3":
        return BDFDB.ReactUtils.createElement(LaunchpadProMK3$1, {
          ref: this.props.innerRef
        });
      default:
        return null;
    }
  }
}

/**
 * WEBMIDI.js v3.0.21
 * A JavaScript library to kickstart your MIDI projects
 * https://webmidijs.org
 * Build generated on July 1st, 2022.
 *
 * © Copyright 2015-2022, Jean-Philippe Côté.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

class e{constructor(e=!1){this.eventMap={},this.eventsSuspended=1==e;}addListener(n,s,r={}){if("string"==typeof n&&n.length<1||n instanceof String&&n.length<1||"string"!=typeof n&&!(n instanceof String)&&n!==e.ANY_EVENT)throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");if("function"!=typeof s)throw new TypeError("The callback must be a function.");const a=new t(n,this,s,r);return this.eventMap[n]||(this.eventMap[n]=[]),r.prepend?this.eventMap[n].unshift(a):this.eventMap[n].push(a),a}addOneTimeListener(e,t,n={}){n.remaining=1,this.addListener(e,t,n);}static get ANY_EVENT(){return Symbol.for("Any event")}hasListener(n,s){if(void 0===n)return !!(this.eventMap[e.ANY_EVENT]&&this.eventMap[e.ANY_EVENT].length>0)||Object.entries(this.eventMap).some(([,e])=>e.length>0);if(this.eventMap[n]&&this.eventMap[n].length>0){if(s instanceof t){return this.eventMap[n].filter(e=>e===s).length>0}if("function"==typeof s){return this.eventMap[n].filter(e=>e.callback===s).length>0}return null==s}return !1}get eventNames(){return Object.keys(this.eventMap)}getListeners(e){return this.eventMap[e]||[]}suspendEvent(e){this.getListeners(e).forEach(e=>{e.suspended=!0;});}unsuspendEvent(e){this.getListeners(e).forEach(e=>{e.suspended=!1;});}getListenerCount(e){return this.getListeners(e).length}emit(t,...n){if("string"!=typeof t&&!(t instanceof String))throw new TypeError("The 'event' parameter must be a string.");if(this.eventsSuspended)return;let s=[],r=this.eventMap[e.ANY_EVENT]||[];return this.eventMap[t]&&(r=r.concat(this.eventMap[t])),r.forEach(e=>{if(e.suspended)return;let t=[...n];Array.isArray(e.arguments)&&(t=t.concat(e.arguments)),e.remaining>0&&(s.push(e.callback.apply(e.context,t)),e.count++),--e.remaining<1&&e.remove();}),s}removeListener(e,t,n={}){if(void 0===e)return void(this.eventMap={});if(!this.eventMap[e])return;let s=this.eventMap[e].filter(e=>t&&e.callback!==t||n.remaining&&n.remaining!==e.remaining||n.context&&n.context!==e.context);s.length?this.eventMap[e]=s:delete this.eventMap[e];}async waitFor(e,t={}){return t.duration=parseInt(t.duration),(isNaN(t.duration)||t.duration<=0)&&(t.duration=1/0),new Promise((n,s)=>{let r,a=this.addListener(e,()=>{clearTimeout(r),n();},{remaining:1});t.duration!==1/0&&(r=setTimeout(()=>{a.remove(),s("The duration expired before the event was emitted.");},t.duration));})}get eventCount(){return Object.keys(this.eventMap).length}}class t{constructor(t,n,s,r={}){if("string"!=typeof t&&!(t instanceof String)&&t!==e.ANY_EVENT)throw new TypeError("The 'event' parameter must be a string or EventEmitter.ANY_EVENT.");if(!n)throw new ReferenceError("The 'target' parameter is mandatory.");if("function"!=typeof s)throw new TypeError("The 'callback' must be a function.");void 0===r.arguments||Array.isArray(r.arguments)||(r.arguments=[r.arguments]),(r=Object.assign({context:n,remaining:1/0,arguments:void 0,duration:1/0},r)).duration!==1/0&&setTimeout(()=>this.remove(),r.duration),this.arguments=r.arguments,this.callback=s,this.context=r.context,this.count=0,this.event=t,this.remaining=parseInt(r.remaining)>=1?parseInt(r.remaining):1/0,this.suspended=!1,this.target=n;}remove(){this.target.removeListener(this.event,this.callback,{context:this.context,remaining:this.remaining});}}
/**
 * The `Enumerations` class contains enumerations and arrays of elements used throughout the
 * library. All properties are static and should be referenced using the class name. For example:
 * `Enumerations.MIDI_CHANNEL_MESSAGES`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class n{static get MIDI_CHANNEL_MESSAGES(){return {noteoff:8,noteon:9,keyaftertouch:10,controlchange:11,programchange:12,channelaftertouch:13,pitchbend:14}}static get MIDI_CHANNEL_NUMBERS(){return [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}static get MIDI_CHANNEL_MODE_MESSAGES(){return {allsoundoff:120,resetallcontrollers:121,localcontrol:122,allnotesoff:123,omnimodeoff:124,omnimodeon:125,monomodeon:126,polymodeon:127}}static get MIDI_CONTROL_CHANGE_MESSAGES(){return {bankselectcoarse:0,modulationwheelcoarse:1,breathcontrollercoarse:2,controller3:3,footcontrollercoarse:4,portamentotimecoarse:5,dataentrycoarse:6,volumecoarse:7,balancecoarse:8,controller9:9,pancoarse:10,expressioncoarse:11,effectcontrol1coarse:12,effectcontrol2coarse:13,controller14:14,controller15:15,generalpurposeslider1:16,generalpurposeslider2:17,generalpurposeslider3:18,generalpurposeslider4:19,controller20:20,controller21:21,controller22:22,controller23:23,controller24:24,controller25:25,controller26:26,controller27:27,controller28:28,controller29:29,controller30:30,controller31:31,bankselectfine:32,modulationwheelfine:33,breathcontrollerfine:34,controller35:35,footcontrollerfine:36,portamentotimefine:37,dataentryfine:38,volumefine:39,balancefine:40,controller41:41,panfine:42,expressionfine:43,effectcontrol1fine:44,effectcontrol2fine:45,controller46:46,controller47:47,controller48:48,controller49:49,controller50:50,controller51:51,controller52:52,controller53:53,controller54:54,controller55:55,controller56:56,controller57:57,controller58:58,controller59:59,controller60:60,controller61:61,controller62:62,controller63:63,holdpedal:64,portamento:65,sustenutopedal:66,softpedal:67,legatopedal:68,hold2pedal:69,soundvariation:70,resonance:71,soundreleasetime:72,soundattacktime:73,brightness:74,soundcontrol6:75,soundcontrol7:76,soundcontrol8:77,soundcontrol9:78,soundcontrol10:79,generalpurposebutton1:80,generalpurposebutton2:81,generalpurposebutton3:82,generalpurposebutton4:83,controller84:84,controller85:85,controller86:86,controller87:87,controller88:88,controller89:89,controller90:90,reverblevel:91,tremololevel:92,choruslevel:93,celestelevel:94,phaserlevel:95,databuttonincrement:96,databuttondecrement:97,nonregisteredparametercoarse:98,nonregisteredparameterfine:99,registeredparametercoarse:100,registeredparameterfine:101,controller102:102,controller103:103,controller104:104,controller105:105,controller106:106,controller107:107,controller108:108,controller109:109,controller110:110,controller111:111,controller112:112,controller113:113,controller114:114,controller115:115,controller116:116,controller117:117,controller118:118,controller119:119,allsoundoff:120,resetallcontrollers:121,localcontrol:122,allnotesoff:123,omnimodeoff:124,omnimodeon:125,monomodeon:126,polymodeon:127}}static get MIDI_REGISTERED_PARAMETERS(){return {pitchbendrange:[0,0],channelfinetuning:[0,1],channelcoarsetuning:[0,2],tuningprogram:[0,3],tuningbank:[0,4],modulationrange:[0,5],azimuthangle:[61,0],elevationangle:[61,1],gain:[61,2],distanceratio:[61,3],maximumdistance:[61,4],maximumdistancegain:[61,5],referencedistanceratio:[61,6],panspreadangle:[61,7],rollangle:[61,8]}}static get MIDI_SYSTEM_MESSAGES(){return {sysex:240,timecode:241,songposition:242,songselect:243,tunerequest:246,tuningrequest:246,sysexend:247,clock:248,start:250,continue:251,stop:252,activesensing:254,reset:255,midimessage:0,unknownsystemmessage:-1}}static get CHANNEL_EVENTS(){return ["noteoff","controlchange","noteon","keyaftertouch","programchange","channelaftertouch","pitchbend","allnotesoff","allsoundoff","localcontrol","monomode","omnimode","resetallcontrollers","nrpn","nrpn-dataentrycoarse","nrpn-dataentryfine","nrpn-databuttonincrement","nrpn-databuttondecrement","rpn","rpn-dataentrycoarse","rpn-dataentryfine","rpn-databuttonincrement","rpn-databuttondecrement"]}}
/**
 * The `Note` class represents a single musical note such as `"D3"`, `"G#4"`, `"F-1"`, `"Gb7"`, etc.
 *
 * `Note` objects can be played back on a single channel by calling
 * [`OutputChannel.playNote()`]{@link OutputChannel#playNote} or, on multiple channels of the same
 * output, by calling [`Output.playNote()`]{@link Output#playNote}.
 *
 * The note has [`attack`](#attack) and [`release`](#release) velocities set at `0.5` by default.
 * These can be changed by passing in the appropriate option. It is also possible to set a
 * system-wide default for attack and release velocities by using the
 * [`WebMidi.defaults`](WebMidi#defaults) property.
 *
 * If you prefer to work with raw MIDI values (`0` to `127`), you can use [`rawAttack`](#rawAttack) and
 * [`rawRelease`](#rawRelease) to both get and set the values.
 *
 * The note may have a [`duration`](#duration). If it does, playback will be automatically stopped
 * when the duration has elapsed by sending a `"noteoff"` event. By default, the duration is set to
 * `Infinity`. In this case, it will never stop playing unless explicitly stopped by calling a
 * method such as [`OutputChannel.stopNote()`]{@link OutputChannel#stopNote},
 * [`Output.stopNote()`]{@link Output#stopNote} or similar.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class s{constructor(e,t={}){this.duration=d.defaults.note.duration,this.attack=d.defaults.note.attack,this.release=d.defaults.note.release,null!=t.duration&&(this.duration=t.duration),null!=t.attack&&(this.attack=t.attack),null!=t.rawAttack&&(this.attack=r.from7bitToFloat(t.rawAttack)),null!=t.release&&(this.release=t.release),null!=t.rawRelease&&(this.release=r.from7bitToFloat(t.rawRelease)),Number.isInteger(e)?this.identifier=r.toNoteIdentifier(e):this.identifier=e;}get identifier(){return this._name+(this._accidental||"")+this._octave}set identifier(e){const t=r.getNoteDetails(e);if(d.validation&&!e)throw new Error("Invalid note identifier");this._name=t.name,this._accidental=t.accidental,this._octave=t.octave;}get name(){return this._name}set name(e){if(d.validation&&(e=e.toUpperCase(),!["C","D","E","F","G","A","B"].includes(e)))throw new Error("Invalid name value");this._name=e;}get accidental(){return this._accidental}set accidental(e){if(d.validation&&(e=e.toLowerCase(),!["#","##","b","bb"].includes(e)))throw new Error("Invalid accidental value");this._accidental=e;}get octave(){return this._octave}set octave(e){if(d.validation&&(e=parseInt(e),isNaN(e)))throw new Error("Invalid octave value");this._octave=e;}get duration(){return this._duration}set duration(e){if(d.validation&&(e=parseFloat(e),isNaN(e)||null===e||e<0))throw new RangeError("Invalid duration value.");this._duration=e;}get attack(){return this._attack}set attack(e){if(d.validation&&(e=parseFloat(e),isNaN(e)||!(e>=0&&e<=1)))throw new RangeError("Invalid attack value.");this._attack=e;}get release(){return this._release}set release(e){if(d.validation&&(e=parseFloat(e),isNaN(e)||!(e>=0&&e<=1)))throw new RangeError("Invalid release value.");this._release=e;}get rawAttack(){return r.fromFloatTo7Bit(this._attack)}set rawAttack(e){this._attack=r.from7bitToFloat(e);}get rawRelease(){return r.fromFloatTo7Bit(this._release)}set rawRelease(e){this._release=r.from7bitToFloat(e);}get number(){return r.toNoteNumber(this.identifier)}getOffsetNumber(e=0,t=0){return d.validation&&(e=parseInt(e)||0,t=parseInt(t)||0),Math.min(Math.max(this.number+12*e+t,0),127)}}
/**
 * The `Utilities` class contains general-purpose utility methods. All methods are static and
 * should be called using the class name. For example: `Utilities.getNoteDetails("C4")`.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class r{
/**
   * Returns a MIDI note number matching the identifier passed in the form of a string. The
   * identifier must include the octave number. The identifier also optionally include a sharp (#),
   * a double sharp (##), a flat (b) or a double flat (bb) symbol. For example, these are all valid
   * identifiers: C5, G4, D#-1, F0, Gb7, Eb-1, Abb4, B##6, etc.
   *
   * When converting note identifiers to numbers, C4 is considered to be middle C (MIDI note number
   * 60) as per the scientific pitch notation standard.
   *
   * The resulting note number can be offset by using the `octaveOffset` parameter.
   *
   * @param identifier {string} The identifier in the form of a letter, followed by an optional "#",
   * "##", "b" or "bb" followed by the octave number. For exemple: C5, G4, D#-1, F0, Gb7, Eb-1,
   * Abb4, B##6, etc.
   *
   * @param {number} [octaveOffset=0] A integer to offset the octave by.
   *
   * @returns {number} The MIDI note number (an integer between 0 and 127).
   *
   * @throws RangeError Invalid 'octaveOffset' value
   *
   * @throws TypeError Invalid note identifier
   *
   * @license Apache-2.0
   * @since 3.0.0
   * @static
   */
static toNoteNumber(e,t=0){if(t=null==t?0:parseInt(t),isNaN(t))throw new RangeError("Invalid 'octaveOffset' value");"string"!=typeof e&&(e="");const n=this.getNoteDetails(e);if(!n)throw new TypeError("Invalid note identifier");let s=12*(n.octave+1+t);if(s+={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[n.name],n.accidental&&(n.accidental.startsWith("b")?s-=n.accidental.length:s+=n.accidental.length),s<0||s>127)throw new RangeError("Invalid octaveOffset value");return s}static getNoteDetails(e){Number.isInteger(e)&&(e=this.toNoteIdentifier(e));const t=e.match(/^([CDEFGAB])(#{0,2}|b{0,2})(-?\d+)$/i);if(!t)throw new TypeError("Invalid note identifier");const n=t[1].toUpperCase(),s=parseInt(t[3]);let r=t[2].toLowerCase();return r=""===r?void 0:r,{accidental:r,identifier:n+(r||"")+s,name:n,octave:s}}static sanitizeChannels(e){let t;if(this.validation)if("all"===e)t=["all"];else if("none"===e)return [];return t=Array.isArray(e)?e:[e],t.indexOf("all")>-1&&(t=n.MIDI_CHANNEL_NUMBERS),t.map((function(e){return parseInt(e)})).filter((function(e){return e>=1&&e<=16}))}static toTimestamp(e){let t=!1;const n=parseFloat(e);return !isNaN(n)&&("string"==typeof e&&"+"===e.substring(0,1)?n>=0&&(t=d.time+n):n>=0&&(t=n),t)}static guessNoteNumber(e,t){t=parseInt(t)||0;let n=!1;if(Number.isInteger(e)&&e>=0&&e<=127)n=parseInt(e);else if(parseInt(e)>=0&&parseInt(e)<=127)n=parseInt(e);else if("string"==typeof e||e instanceof String)try{n=this.toNoteNumber(e.trim(),t);}catch(e){return !1}return n}static toNoteIdentifier(e,t){if(e=parseInt(e),isNaN(e)||e<0||e>127)throw new RangeError("Invalid note number");if(t=null==t?0:parseInt(t),isNaN(t))throw new RangeError("Invalid octaveOffset value");const n=Math.floor(e/12-1)+t;return ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"][e%12]+n.toString()}static buildNote(e,t={}){if(t.octaveOffset=parseInt(t.octaveOffset)||0,e instanceof s)return e;let n=this.guessNoteNumber(e,t.octaveOffset);if(!1===n)throw new TypeError(`The input could not be parsed as a note (${e})`);return t.octaveOffset=void 0,new s(n,t)}static buildNoteArray(e,t={}){let n=[];return Array.isArray(e)||(e=[e]),e.forEach(e=>{n.push(this.buildNote(e,t));}),n}static from7bitToFloat(e){return e===1/0&&(e=127),e=parseInt(e)||0,Math.min(Math.max(e/127,0),1)}static fromFloatTo7Bit(e){return e===1/0&&(e=1),e=parseFloat(e)||0,Math.min(Math.max(Math.round(127*e),0),127)}static fromMsbLsbToFloat(e,t=0){d.validation&&(e=Math.min(Math.max(parseInt(e)||0,0),127),t=Math.min(Math.max(parseInt(t)||0,0),127));const n=((e<<7)+t)/16383;return Math.min(Math.max(n,0),1)}static fromFloatToMsbLsb(e){d.validation&&(e=Math.min(Math.max(parseFloat(e)||0,0),1));const t=Math.round(16383*e);return {msb:t>>7,lsb:127&t}}static offsetNumber(e,t=0,n=0){if(d.validation){if(e=parseInt(e),isNaN(e))throw new Error("Invalid note number");t=parseInt(t)||0,n=parseInt(n)||0;}return Math.min(Math.max(e+12*t+n,0),127)}static getPropertyByValue(e,t){return Object.keys(e).find(n=>e[n]===t)}static getCcNameByNumber(e){return r.getPropertyByValue(n.MIDI_CONTROL_CHANGE_MESSAGES,e)}static getChannelModeByNumber(e){if(!(e>=120&&e<=127))return !1;for(let t in n.MIDI_CHANNEL_MODE_MESSAGES)if(n.MIDI_CHANNEL_MODE_MESSAGES.hasOwnProperty(t)&&e===n.MIDI_CHANNEL_MODE_MESSAGES[t])return t;return !1}static get isNode(){return "undefined"!=typeof process&&null!=process.versions&&null!=process.versions.node}static get isBrowser(){return "undefined"!=typeof window&&void 0!==window.document}}
/**
 * The `OutputChannel` class represents a single output MIDI channel. `OutputChannel` objects are
 * provided by an [`Output`](Output) port which, itself, is made available by a device. The
 * `OutputChannel` object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `OutputChannel` objects can be found inside the parent output's
 * [`channels`]{@link Output#channels} property.
 *
 * @param {Output} output The [`Output`](Output) this channel belongs to.
 * @param {number} number The MIDI channel number (`1` - `16`).
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */class a extends e{constructor(e,t){super(),this._output=e,this._number=t,this._octaveOffset=0;}destroy(){this._output=null,this._number=null,this._octaveOffset=0,this.removeListener();}send(e,t={time:0}){return this.output.send(e,t),this}sendKeyAftertouch(e,t,s={}){if(d.validation){if(s.useRawValue&&(s.rawValue=s.useRawValue),isNaN(parseFloat(t)))throw new RangeError("Invalid key aftertouch value.");if(s.rawValue){if(!(t>=0&&t<=127&&Number.isInteger(t)))throw new RangeError("Key aftertouch raw value must be an integer between 0 and 127.")}else if(!(t>=0&&t<=1))throw new RangeError("Key aftertouch value must be a float between 0 and 1.")}s.rawValue||(t=r.fromFloatTo7Bit(t));const a=d.octaveOffset+this.output.octaveOffset+this.octaveOffset;return Array.isArray(e)||(e=[e]),r.buildNoteArray(e).forEach(e=>{this.send([(n.MIDI_CHANNEL_MESSAGES.keyaftertouch<<4)+(this.number-1),e.getOffsetNumber(a),t],{time:r.toTimestamp(s.time)});}),this}
/**
   * Sends a MIDI **control change** message to the channel at the scheduled time. The control
   * change message to send can be specified numerically (`0` to `127`) or by using one of the
   * following common names:
   *
   * | Number | Name                          |
   * |--------|-------------------------------|
   * | 0      |`bankselectcoarse`             |
   * | 1      |`modulationwheelcoarse`        |
   * | 2      |`breathcontrollercoarse`       |
   * | 4      |`footcontrollercoarse`         |
   * | 5      |`portamentotimecoarse`         |
   * | 6      |`dataentrycoarse`              |
   * | 7      |`volumecoarse`                 |
   * | 8      |`balancecoarse`                |
   * | 10     |`pancoarse`                    |
   * | 11     |`expressioncoarse`             |
   * | 12     |`effectcontrol1coarse`         |
   * | 13     |`effectcontrol2coarse`         |
   * | 18     |`generalpurposeslider3`        |
   * | 19     |`generalpurposeslider4`        |
   * | 32     |`bankselectfine`               |
   * | 33     |`modulationwheelfine`          |
   * | 34     |`breathcontrollerfine`         |
   * | 36     |`footcontrollerfine`           |
   * | 37     |`portamentotimefine`           |
   * | 38     |`dataentryfine`                |
   * | 39     |`volumefine`                   |
   * | 40     |`balancefine`                  |
   * | 42     |`panfine`                      |
   * | 43     |`expressionfine`               |
   * | 44     |`effectcontrol1fine`           |
   * | 45     |`effectcontrol2fine`           |
   * | 64     |`holdpedal`                    |
   * | 65     |`portamento`                   |
   * | 66     |`sustenutopedal`               |
   * | 67     |`softpedal`                    |
   * | 68     |`legatopedal`                  |
   * | 69     |`hold2pedal`                   |
   * | 70     |`soundvariation`               |
   * | 71     |`resonance`                    |
   * | 72     |`soundreleasetime`             |
   * | 73     |`soundattacktime`              |
   * | 74     |`brightness`                   |
   * | 75     |`soundcontrol6`                |
   * | 76     |`soundcontrol7`                |
   * | 77     |`soundcontrol8`                |
   * | 78     |`soundcontrol9`                |
   * | 79     |`soundcontrol10`               |
   * | 80     |`generalpurposebutton1`        |
   * | 81     |`generalpurposebutton2`        |
   * | 82     |`generalpurposebutton3`        |
   * | 83     |`generalpurposebutton4`        |
   * | 91     |`reverblevel`                  |
   * | 92     |`tremololevel`                 |
   * | 93     |`choruslevel`                  |
   * | 94     |`celestelevel`                 |
   * | 95     |`phaserlevel`                  |
   * | 96     |`databuttonincrement`          |
   * | 97     |`databuttondecrement`          |
   * | 98     |`nonregisteredparametercoarse` |
   * | 99     |`nonregisteredparameterfine`   |
   * | 100    |`registeredparametercoarse`    |
   * | 101    |`registeredparameterfine`      |
   * | 120    |`allsoundoff`                  |
   * | 121    |`resetallcontrollers`          |
   * | 122    |`localcontrol`                 |
   * | 123    |`allnotesoff`                  |
   * | 124    |`omnimodeoff`                  |
   * | 125    |`omnimodeon`                   |
   * | 126    |`monomodeon`                   |
   * | 127    |`polymodeon`                   |
   *
   * As you can see above, not all control change message have a matching name. This does not mean
   * you cannot use the others. It simply means you will need to use their number
   * (`0` to `127`) instead of their name. While you can still use them, numbers `120` to `127` are
   * usually reserved for *channel mode* messages. See
   * [`sendChannelMode()`]{@link OutputChannel#sendChannelMode} method for more info.
   *
   * To view a detailed list of all available **control change** messages, please consult "Table 3 -
   * Control Change Messages" from the [MIDI Messages](
   * https://www.midi.org/specifications/item/table-3-control-change-messages-data-bytes-2)
   * specification.
   *
   * **Note**: messages #0-31 (MSB) are paired with messages #32-63 (LSB). For example, message #1
   * (`modulationwheelcoarse`) can be accompanied by a second control change message for
   * `modulationwheelfine` to achieve a greater level of precision. if you want to specify both MSB
   * and LSB for messages between `0` and `31`, you can do so by passing a 2-value array as the
   * second parameter.
   *
   * @param {number|string} controller The MIDI controller name or number (`0` - `127`).
   *
   * @param {number|number[]} value The value to send (0-127). You can also use a two-position array
   * for controllers 0 to 31. In this scenario, the first value will be sent as usual and the second
   * value will be sent to the matching LSB controller (which is obtained by adding 32 to the first
   * controller)
   *
   * @param {object} [options={}]
   *
   * @param {number|string} [options.time=(now)] If `time` is a string prefixed with `"+"` and
   * followed by a number, the message will be delayed by that many milliseconds. If the value is a
   * positive number
   * ([`DOMHighResTimeStamp`]{@link https://developer.mozilla.org/docs/Web/API/DOMHighResTimeStamp}),
   * the operation will be scheduled for that time. The current time can be retrieved with
   * [`WebMidi.time`]{@link WebMidi#time}. If `options.time` is omitted, or in the past, the
   * operation will be carried out as soon as possible.
   *
   * @throws {RangeError} Controller numbers must be between 0 and 127.
   * @throws {RangeError} Invalid controller name.
   * @throws {TypeError} The value array must have a length of 2.
   *
   * @returns {OutputChannel} Returns the `OutputChannel` object so methods can be chained.
   *
   * @license Apache-2.0
   * @since 3.0.0
   */sendControlChange(e,t,s={}){if("string"==typeof e&&(e=n.MIDI_CONTROL_CHANGE_MESSAGES[e]),Array.isArray(t)||(t=[t]),d.validation){if(void 0===e)throw new TypeError("Control change must be identified with a valid name or an integer between 0 and 127.");if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new TypeError("Control change number must be an integer between 0 and 127.");if(2===(t=t.map(e=>{const t=Math.min(Math.max(parseInt(e),0),127);if(isNaN(t))throw new TypeError("Values must be integers between 0 and 127");return t})).length&&e>=32)throw new TypeError("To use a value array, the controller must be between 0 and 31")}return t.forEach((a,i)=>{this.send([(n.MIDI_CHANNEL_MESSAGES.controlchange<<4)+(this.number-1),e+32*i,t[i]],{time:r.toTimestamp(s.time)});}),this}_selectNonRegisteredParameter(e,t={}){return this.sendControlChange(99,e[0],t),this.sendControlChange(98,e[1],t),this}_deselectRegisteredParameter(e={}){return this.sendControlChange(101,127,e),this.sendControlChange(100,127,e),this}_deselectNonRegisteredParameter(e={}){return this.sendControlChange(101,127,e),this.sendControlChange(100,127,e),this}_selectRegisteredParameter(e,t={}){return this.sendControlChange(101,e[0],t),this.sendControlChange(100,e[1],t),this}_setCurrentParameter(e,t={}){return e=[].concat(e),this.sendControlChange(6,e[0],t),e.length<2||this.sendControlChange(38,e[1],t),this}sendRpnDecrement(e,t={}){if(Array.isArray(e)||(e=n.MIDI_REGISTERED_PARAMETERS[e]),d.validation){if(void 0===e)throw new TypeError("The specified registered parameter is invalid.");let t=!1;if(Object.getOwnPropertyNames(n.MIDI_REGISTERED_PARAMETERS).forEach(s=>{n.MIDI_REGISTERED_PARAMETERS[s][0]===e[0]&&n.MIDI_REGISTERED_PARAMETERS[s][1]===e[1]&&(t=!0);}),!t)throw new TypeError("The specified registered parameter is invalid.")}return this._selectRegisteredParameter(e,t),this.sendControlChange(97,0,t),this._deselectRegisteredParameter(t),this}sendRpnIncrement(e,t={}){if(Array.isArray(e)||(e=n.MIDI_REGISTERED_PARAMETERS[e]),d.validation){if(void 0===e)throw new TypeError("The specified registered parameter is invalid.");let t=!1;if(Object.getOwnPropertyNames(n.MIDI_REGISTERED_PARAMETERS).forEach(s=>{n.MIDI_REGISTERED_PARAMETERS[s][0]===e[0]&&n.MIDI_REGISTERED_PARAMETERS[s][1]===e[1]&&(t=!0);}),!t)throw new TypeError("The specified registered parameter is invalid.")}return this._selectRegisteredParameter(e,t),this.sendControlChange(96,0,t),this._deselectRegisteredParameter(t),this}playNote(e,t={}){if(this.sendNoteOn(e,t),t.duration>0&&isFinite(String(t.duration).trim()||NaN)){let n={time:(r.toTimestamp(t.time)||d.time)+t.duration,release:t.release,rawRelease:t.rawRelease};this.sendNoteOff(e,n);}return this}sendNoteOff(e,t={}){if(d.validation){if(null!=t.rawRelease&&!(t.rawRelease>=0&&t.rawRelease<=127))throw new RangeError("The 'rawRelease' option must be an integer between 0 and 127");if(null!=t.release&&!(t.release>=0&&t.release<=1))throw new RangeError("The 'release' option must be an number between 0 and 1");t.rawVelocity&&(t.rawRelease=t.velocity,console.warn("The 'rawVelocity' option is deprecated. Use 'rawRelease' instead.")),t.velocity&&(t.release=t.velocity,console.warn("The 'velocity' option is deprecated. Use 'attack' instead."));}let s=64;null!=t.rawRelease?s=t.rawRelease:isNaN(t.release)||(s=Math.round(127*t.release));const a=d.octaveOffset+this.output.octaveOffset+this.octaveOffset;return r.buildNoteArray(e,{rawRelease:parseInt(s)}).forEach(e=>{this.send([(n.MIDI_CHANNEL_MESSAGES.noteoff<<4)+(this.number-1),e.getOffsetNumber(a),e.rawRelease],{time:r.toTimestamp(t.time)});}),this}stopNote(e,t={}){return this.sendNoteOff(e,t)}sendNoteOn(e,t={}){if(d.validation){if(null!=t.rawAttack&&!(t.rawAttack>=0&&t.rawAttack<=127))throw new RangeError("The 'rawAttack' option must be an integer between 0 and 127");if(null!=t.attack&&!(t.attack>=0&&t.attack<=1))throw new RangeError("The 'attack' option must be an number between 0 and 1");t.rawVelocity&&(t.rawAttack=t.velocity,t.rawRelease=t.release,console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' or 'rawRelease'.")),t.velocity&&(t.attack=t.velocity,console.warn("The 'velocity' option is deprecated. Use 'attack' instead."));}let s=64;null!=t.rawAttack?s=t.rawAttack:isNaN(t.attack)||(s=Math.round(127*t.attack));const a=d.octaveOffset+this.output.octaveOffset+this.octaveOffset;return r.buildNoteArray(e,{rawAttack:s}).forEach(e=>{this.send([(n.MIDI_CHANNEL_MESSAGES.noteon<<4)+(this.number-1),e.getOffsetNumber(a),e.rawAttack],{time:r.toTimestamp(t.time)});}),this}sendChannelMode(e,t=0,s={}){if("string"==typeof e&&(e=n.MIDI_CHANNEL_MODE_MESSAGES[e]),d.validation){if(void 0===e)throw new TypeError("Invalid channel mode message name or number.");if(isNaN(e)||!(e>=120&&e<=127))throw new TypeError("Invalid channel mode message number.");if(isNaN(parseInt(t))||t<0||t>127)throw new RangeError("Value must be an integer between 0 and 127.")}return this.send([(n.MIDI_CHANNEL_MESSAGES.controlchange<<4)+(this.number-1),e,t],{time:r.toTimestamp(s.time)}),this}sendOmniMode(e,t={}){return void 0===e||e?this.sendChannelMode("omnimodeon",0,t):this.sendChannelMode("omnimodeoff",0,t),this}sendChannelAftertouch(e,t={}){if(d.validation){if(isNaN(parseFloat(e)))throw new RangeError("Invalid channel aftertouch value.");if(t.rawValue){if(!(e>=0&&e<=127&&Number.isInteger(e)))throw new RangeError("Channel aftertouch raw value must be an integer between 0 and 127.")}else if(!(e>=0&&e<=1))throw new RangeError("Channel aftertouch value must be a float between 0 and 1.")}return this.send([(n.MIDI_CHANNEL_MESSAGES.channelaftertouch<<4)+(this.number-1),Math.round(127*e)],{time:r.toTimestamp(t.time)}),this}sendMasterTuning(e,t={}){if(e=parseFloat(e)||0,d.validation&&!(e>-65&&e<64))throw new RangeError("The value must be a decimal number larger than -65 and smaller than 64.");let n=Math.floor(e)+64,s=e-Math.floor(e);s=Math.round((s+1)/2*16383);let r=s>>7&127,a=127&s;return this.sendRpnValue("channelcoarsetuning",n,t),this.sendRpnValue("channelfinetuning",[r,a],t),this}sendModulationRange(e,t,n={}){if(d.validation){if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new RangeError("The semitones value must be an integer between 0 and 127.");if(!(null==t||Number.isInteger(t)&&t>=0&&t<=127))throw new RangeError("If specified, the cents value must be an integer between 0 and 127.")}return t>=0&&t<=127||(t=0),this.sendRpnValue("modulationrange",[e,t],n),this}sendNrpnValue(e,t,n={}){if(t=[].concat(t),d.validation){if(!Array.isArray(e)||!Number.isInteger(e[0])||!Number.isInteger(e[1]))throw new TypeError("The specified NRPN is invalid.");if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The first byte of the NRPN must be between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The second byte of the NRPN must be between 0 and 127.");t.forEach(e=>{if(!(e>=0&&e<=127))throw new RangeError("The data bytes of the NRPN must be between 0 and 127.")});}return this._selectNonRegisteredParameter(e,n),this._setCurrentParameter(t,n),this._deselectNonRegisteredParameter(n),this}sendPitchBend(e,t={}){if(d.validation)if(t.rawValue&&Array.isArray(e)){if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The pitch bend LSB must be an integer between 0 and 127.")}else if(t.rawValue&&!Array.isArray(e)){if(!(e>=0&&e<=127))throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.")}else {if(isNaN(e)||null===e)throw new RangeError("Invalid pitch bend value.");if(!(e>=-1&&e<=1))throw new RangeError("The pitch bend MSB must be an integer between 0 and 127.")}let s=0,a=0;if(t.rawValue&&Array.isArray(e))s=e[0],a=e[1];else if(t.rawValue&&!Array.isArray(e))s=e;else {const t=r.fromFloatToMsbLsb((e+1)/2);s=t.msb,a=t.lsb;}return this.send([(n.MIDI_CHANNEL_MESSAGES.pitchbend<<4)+(this.number-1),a,s],{time:r.toTimestamp(t.time)}),this}sendPitchBendRange(e,t,n={}){if(d.validation){if(!Number.isInteger(e)||!(e>=0&&e<=127))throw new RangeError("The semitones value must be an integer between 0 and 127.");if(!Number.isInteger(t)||!(t>=0&&t<=127))throw new RangeError("The cents value must be an integer between 0 and 127.")}return this.sendRpnValue("pitchbendrange",[e,t],n),this}sendProgramChange(e,t={}){if(e=parseInt(e)||0,d.validation&&!(e>=0&&e<=127))throw new RangeError("The program number must be between 0 and 127.");return this.send([(n.MIDI_CHANNEL_MESSAGES.programchange<<4)+(this.number-1),e],{time:r.toTimestamp(t.time)}),this}sendRpnValue(e,t,s={}){if(Array.isArray(e)||(e=n.MIDI_REGISTERED_PARAMETERS[e]),d.validation){if(!Number.isInteger(e[0])||!Number.isInteger(e[1]))throw new TypeError("The specified NRPN is invalid.");if(!(e[0]>=0&&e[0]<=127))throw new RangeError("The first byte of the RPN must be between 0 and 127.");if(!(e[1]>=0&&e[1]<=127))throw new RangeError("The second byte of the RPN must be between 0 and 127.");[].concat(t).forEach(e=>{if(!(e>=0&&e<=127))throw new RangeError("The data bytes of the RPN must be between 0 and 127.")});}return this._selectRegisteredParameter(e,s),this._setCurrentParameter(t,s),this._deselectRegisteredParameter(s),this}sendTuningBank(e,t={}){if(d.validation&&(!Number.isInteger(e)||!(e>=0&&e<=127)))throw new RangeError("The tuning bank number must be between 0 and 127.");return this.sendRpnValue("tuningbank",e,t),this}sendTuningProgram(e,t={}){if(d.validation&&(!Number.isInteger(e)||!(e>=0&&e<=127)))throw new RangeError("The tuning program number must be between 0 and 127.");return this.sendRpnValue("tuningprogram",e,t),this}sendLocalControl(e,t={}){return e?this.sendChannelMode("localcontrol",127,t):this.sendChannelMode("localcontrol",0,t)}sendAllNotesOff(e={}){return this.sendChannelMode("allnotesoff",0,e)}sendAllSoundOff(e={}){return this.sendChannelMode("allsoundoff",0,e)}sendResetAllControllers(e={}){return this.sendChannelMode("resetallcontrollers",0,e)}sendPolyphonicMode(e,t={}){return "mono"===e?this.sendChannelMode("monomodeon",0,t):this.sendChannelMode("polymodeon",0,t)}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e;}get output(){return this._output}get number(){return this._number}}
/**
 * The `Output` class represents a single MIDI output port (not to be confused with a MIDI channel).
 * A port is made available by a MIDI device. A MIDI device can advertise several input and output
 * ports. Each port has 16 MIDI channels which can be accessed via the [`channels`](#channels)
 * property.
 *
 * The `Output` object is automatically instantiated by the library according to the host's MIDI
 * subsystem and should not be directly instantiated.
 *
 * You can access all available `Output` objects by referring to the
 * [`WebMidi.outputs`](WebMidi#outputs) array or by using methods such as
 * [`WebMidi.getOutputByName()`](WebMidi#getOutputByName) or
 * [`WebMidi.getOutputById()`](WebMidi#getOutputById).
 *
 * @fires Output#opened
 * @fires Output#disconnected
 * @fires Output#closed
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */class i extends e{constructor(e){super(),this._midiOutput=e,this._octaveOffset=0,this.channels=[];for(let e=1;e<=16;e++)this.channels[e]=new a(this,e);this._midiOutput.onstatechange=this._onStateChange.bind(this);}async destroy(){this.removeListener(),this.channels.forEach(e=>e.destroy()),this.channels=[],this._midiOutput.onstatechange=null,await this.close(),this._midiOutput=null;}_onStateChange(e){let t={timestamp:d.time};"open"===e.port.connection?(t.type="opened",t.target=this,t.port=t.target,this.emit("opened",t)):"closed"===e.port.connection&&"connected"===e.port.state?(t.type="closed",t.target=this,t.port=t.target,this.emit("closed",t)):"closed"===e.port.connection&&"disconnected"===e.port.state?(t.type="disconnected",t.port={connection:e.port.connection,id:e.port.id,manufacturer:e.port.manufacturer,name:e.port.name,state:e.port.state,type:e.port.type},this.emit("disconnected",t)):"pending"===e.port.connection&&"disconnected"===e.port.state||console.warn("This statechange event was not caught:",e.port.connection,e.port.state);}async open(){try{return await this._midiOutput.open(),Promise.resolve(this)}catch(e){return Promise.reject(e)}}async close(){this._midiOutput?await this._midiOutput.close():await Promise.resolve();}
/**
   * Sends a MIDI message on the MIDI output port. If no time is specified, the message will be
   * sent immediately. The message should be an array of 8 bit unsigned integers (0-225), a
   * [`Uint8Array`]{@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array}
   * object or a [`Message`](Message) object.
   *
   * It is usually not necessary to use this method directly as you can use one of the simpler
   * helper methods such as [`playNote()`](#playNote), [`stopNote()`](#stopNote),
   * [`sendControlChange()`](#sendControlChange), etc.
   *
   * Details on the format of MIDI messages are available in the summary of
   * [MIDI messages]{@link https://www.midi.org/specifications-old/item/table-1-summary-of-midi-message}
   * from the MIDI Manufacturers Association.
   *
   * @param message {number[]|Uint8Array|Message} An array of 8bit unsigned integers, a `Uint8Array`
   * object (not available in Node.js) containing the message bytes or a `Message` object.
   *
   * @param {object} [options={}]
   *
   * @param {number|string} [options.time=(now)] If `time` is a string prefixed with `"+"` and
   * followed by a number, the message will be delayed by that many milliseconds. If the value is a
   * positive number
   * ([`DOMHighResTimeStamp`]{@link https://developer.mozilla.org/docs/Web/API/DOMHighResTimeStamp}),
   * the operation will be scheduled for that time. The current time can be retrieved with
   * [`WebMidi.time`]{@link WebMidi#time}. If `options.time` is omitted, or in the past, the
   * operation will be carried out as soon as possible.
   *
   * @throws {RangeError} The first byte (status) must be an integer between 128 and 255.
   *
   * @returns {Output} Returns the `Output` object so methods can be chained.
   *
   * @license Apache-2.0
   */send(e,t={time:0},n=0){if(e instanceof h&&(e=r.isNode?e.data:e.rawData),e instanceof Uint8Array&&r.isNode&&(e=Array.from(e)),d.validation){if(Array.isArray(e)||e instanceof Uint8Array||(e=[e],Array.isArray(t)&&(e=e.concat(t)),t=isNaN(n)?{time:0}:{time:n}),!(parseInt(e[0])>=128&&parseInt(e[0])<=255))throw new RangeError("The first byte (status) must be an integer between 128 and 255.");e.slice(1).forEach(e=>{if(!((e=parseInt(e))>=0&&e<=255))throw new RangeError("Data bytes must be integers between 0 and 255.")}),t||(t={time:0});}return this._midiOutput.send(e,r.toTimestamp(t.time)),this}sendSysex(e,t=[],s={}){if(e=[].concat(e),t instanceof Uint8Array){const r=new Uint8Array(1+e.length+t.length+1);r[0]=n.MIDI_SYSTEM_MESSAGES.sysex,r.set(Uint8Array.from(e),1),r.set(t,1+e.length),r[r.length-1]=n.MIDI_SYSTEM_MESSAGES.sysexend,this.send(r,{time:s.time});}else {const r=e.concat(t,n.MIDI_SYSTEM_MESSAGES.sysexend);this.send([n.MIDI_SYSTEM_MESSAGES.sysex].concat(r),{time:s.time});}return this}clear(){return this._midiOutput.clear?this._midiOutput.clear():d.validation&&console.warn("The 'clear()' method has not yet been implemented in your environment."),this}sendTimecodeQuarterFrame(e,t={}){if(d.validation&&(e=parseInt(e),isNaN(e)||!(e>=0&&e<=127)))throw new RangeError("The value must be an integer between 0 and 127.");return this.send([n.MIDI_SYSTEM_MESSAGES.timecode,e],{time:t.time}),this}sendSongPosition(e=0,t={}){var s=(e=Math.floor(e)||0)>>7&127,r=127&e;return this.send([n.MIDI_SYSTEM_MESSAGES.songposition,s,r],{time:t.time}),this}sendSongSelect(e=0,t={}){if(d.validation&&(e=parseInt(e),isNaN(e)||!(e>=0&&e<=127)))throw new RangeError("The program value must be between 0 and 127");return this.send([n.MIDI_SYSTEM_MESSAGES.songselect,e],{time:t.time}),this}sendTuneRequest(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.tunerequest],{time:e.time}),this}sendClock(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.clock],{time:e.time}),this}sendStart(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.start],{time:e.time}),this}sendContinue(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.continue],{time:e.time}),this}sendStop(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.stop],{time:e.time}),this}sendActiveSensing(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.activesensing],{time:e.time}),this}sendReset(e={}){return this.send([n.MIDI_SYSTEM_MESSAGES.reset],{time:e.time}),this}sendTuningRequest(e={}){return d.validation&&console.warn("The sendTuningRequest() method has been deprecated. Use sendTuningRequest() instead."),this.sendTuneRequest(e)}sendKeyAftertouch(e,t,s={}){return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendKeyAftertouch(e,t,s);}),this}sendControlChange(e,t,s={},a={}){if(d.validation&&(Array.isArray(s)||Number.isInteger(s)||"all"===s)){const e=s;(s=a).channels=e,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS);}return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendControlChange(e,t,s);}),this}sendPitchBendRange(e=0,t=0,s={}){return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendPitchBendRange(e,t,s);}),this}setPitchBendRange(e=0,t=0,s="all",r={}){return d.validation&&(console.warn("The setPitchBendRange() method is deprecated. Use sendPitchBendRange() instead."),r.channels=s,"all"===r.channels&&(r.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendPitchBendRange(e,t,r)}sendRpnValue(e,t,s={}){return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendRpnValue(e,t,s);}),this}setRegisteredParameter(e,t=[],s="all",r={}){return d.validation&&(console.warn("The setRegisteredParameter() method is deprecated. Use sendRpnValue() instead."),r.channels=s,"all"===r.channels&&(r.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendRpnValue(e,t,r)}sendChannelAftertouch(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendChannelAftertouch(e,t);}),this}sendPitchBend(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendPitchBend(e,t);}),this}sendProgramChange(e=0,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendProgramChange(e,t);}),this}sendModulationRange(e,t,s={}){return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendModulationRange(e,t,s);}),this}setModulationRange(e=0,t=0,s="all",r={}){return d.validation&&(console.warn("The setModulationRange() method is deprecated. Use sendModulationRange() instead."),r.channels=s,"all"===r.channels&&(r.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendModulationRange(e,t,r)}sendMasterTuning(e,t={}){return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendMasterTuning(e,t);}),this}setMasterTuning(e,t={},s={}){return d.validation&&(console.warn("The setMasterTuning() method is deprecated. Use sendMasterTuning() instead."),s.channels=t,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendMasterTuning(e,s)}sendTuningProgram(e,t={}){return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendTuningProgram(e,t);}),this}setTuningProgram(e,t="all",s={}){return d.validation&&(console.warn("The setTuningProgram() method is deprecated. Use sendTuningProgram() instead."),s.channels=t,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendTuningProgram(e,s)}sendTuningBank(e=0,t={}){return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendTuningBank(e,t);}),this}setTuningBank(e,t="all",s={}){return d.validation&&(console.warn("The setTuningBank() method is deprecated. Use sendTuningBank() instead."),s.channels=t,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendTuningBank(e,s)}sendChannelMode(e,t=0,s={},a={}){if(d.validation&&(Array.isArray(s)||Number.isInteger(s)||"all"===s)){const e=s;(s=a).channels=e,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS);}return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendChannelMode(e,t,s);}),this}sendAllSoundOff(e={}){return null==e.channels&&(e.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(e.channels).forEach(t=>{this.channels[t].sendAllSoundOff(e);}),this}sendAllNotesOff(e={}){return null==e.channels&&(e.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(e.channels).forEach(t=>{this.channels[t].sendAllNotesOff(e);}),this}sendResetAllControllers(e={},t={}){if(d.validation&&(Array.isArray(e)||Number.isInteger(e)||"all"===e)){const s=e;(e=t).channels=s,"all"===e.channels&&(e.channels=n.MIDI_CHANNEL_NUMBERS);}return null==e.channels&&(e.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(e.channels).forEach(t=>{this.channels[t].sendResetAllControllers(e);}),this}sendPolyphonicMode(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendPolyphonicMode(e,t);}),this}sendLocalControl(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendLocalControl(e,t);}),this}sendOmniMode(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendOmniMode(e,t);}),this}sendNrpnValue(e,t,s={}){return null==s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].sendNrpnValue(e,t,s);}),this}setNonRegisteredParameter(e,t=[],s="all",r={}){return d.validation&&(console.warn("The setNonRegisteredParameter() method is deprecated. Use sendNrpnValue() instead."),r.channels=s,"all"===r.channels&&(r.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendNrpnValue(e,t,r)}sendRpnIncrement(e,t={}){return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendRpnIncrement(e,t);}),this}incrementRegisteredParameter(e,t="all",s={}){return d.validation&&(console.warn("The incrementRegisteredParameter() method is deprecated. Use sendRpnIncrement() instead."),s.channels=t,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendRpnIncrement(e,s)}sendRpnDecrement(e,t={}){return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendRpnDecrement(e,t);}),this}decrementRegisteredParameter(e,t="all",s={}){return d.validation&&(console.warn("The decrementRegisteredParameter() method is deprecated. Use sendRpnDecrement() instead."),s.channels=t,"all"===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS)),this.sendRpnDecrement(e,s)}sendNoteOff(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendNoteOff(e,t);}),this}stopNote(e,t){return this.sendNoteOff(e,t)}playNote(e,t={},s={}){if(d.validation&&(t.rawVelocity&&console.warn("The 'rawVelocity' option is deprecated. Use 'rawAttack' instead."),t.velocity&&console.warn("The 'velocity' option is deprecated. Use 'velocity' instead."),Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].playNote(e,t);}),this}sendNoteOn(e,t={},s={}){if(d.validation&&(Array.isArray(t)||Number.isInteger(t)||"all"===t)){const e=t;(t=s).channels=e,"all"===t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS);}return null==t.channels&&(t.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(t.channels).forEach(n=>{this.channels[n].sendNoteOn(e,t);}),this}get name(){return this._midiOutput.name}get id(){return this._midiOutput.id}get connection(){return this._midiOutput.connection}get manufacturer(){return this._midiOutput.manufacturer}get state(){return this._midiOutput.state}get type(){return this._midiOutput.type}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e;}}
/**
 * The `Forwarder` class allows the forwarding of MIDI messages to predetermined outputs. When you
 * call its [`forward()`](#forward) method, it will send the specified [`Message`](Message) object
 * to all the outputs listed in its [`destinations`](#destinations) property.
 *
 * If specific channels or message types have been defined in the [`channels`](#channels) or
 * [`types`](#types) properties, only messages matching the channels/types will be forwarded.
 *
 * While it can be manually instantiated, you are more likely to come across a `Forwarder` object as
 * the return value of the [`Input.addForwarder()`](Input#addForwarder) method.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class o{constructor(e=[],t={}){this.destinations=[],this.types=[...Object.keys(n.MIDI_SYSTEM_MESSAGES),...Object.keys(n.MIDI_CHANNEL_MESSAGES)],this.channels=n.MIDI_CHANNEL_NUMBERS,this.suspended=!1,Array.isArray(e)||(e=[e]),t.types&&!Array.isArray(t.types)&&(t.types=[t.types]),t.channels&&!Array.isArray(t.channels)&&(t.channels=[t.channels]),d.validation&&(e.forEach(e=>{if(!(e instanceof i))throw new TypeError("Destinations must be of type 'Output'.")}),void 0!==t.types&&t.types.forEach(e=>{if(!n.MIDI_SYSTEM_MESSAGES.hasOwnProperty(e)&&!n.MIDI_CHANNEL_MESSAGES.hasOwnProperty(e))throw new TypeError("Type must be a valid message type.")}),void 0!==t.channels&&t.channels.forEach(e=>{if(!n.MIDI_CHANNEL_NUMBERS.includes(e))throw new TypeError("MIDI channel must be between 1 and 16.")})),this.destinations=e,t.types&&(this.types=t.types),t.channels&&(this.channels=t.channels);}forward(e){this.suspended||this.types.includes(e.type)&&(e.channel&&!this.channels.includes(e.channel)||this.destinations.forEach(t=>{(!d.validation||t instanceof i)&&t.send(e);}));}}
/**
 * The `InputChannel` class represents a single MIDI input channel (1-16) from a single input
 * device. This object is derived from the host's MIDI subsystem and should not be instantiated
 * directly.
 *
 * All 16 `InputChannel` objects can be found inside the input's [`channels`](Input#channels)
 * property.
 *
 * @fires InputChannel#midimessage
 * @fires InputChannel#unknownmessage
 *
 * @fires InputChannel#noteoff
 * @fires InputChannel#noteon
 * @fires InputChannel#keyaftertouch
 * @fires InputChannel#programchange
 * @fires InputChannel#event:controlchange-controllerxxx
 * @fires InputChannel#channelaftertouch
 * @fires InputChannel#pitchbend
 * @fires InputChannel#controlchange
 *
 * @fires InputChannel#allnotesoff
 * @fires InputChannel#allsoundoff
 * @fires InputChannel#localcontrol
 * @fires InputChannel#monomode
 * @fires InputChannel#omnimode
 * @fires InputChannel#resetallcontrollers
 *
 * @fires InputChannel#event:nrpn
 * @fires InputChannel#event:nrpn-dataentrycoarse
 * @fires InputChannel#event:nrpn-dataentryfine
 * @fires InputChannel#event:nrpn-databuttonincrement
 * @fires InputChannel#event:nrpn-databuttondecrement
 * @fires InputChannel#event:rpn
 * @fires InputChannel#event:rpn-dataentrycoarse
 * @fires InputChannel#event:rpn-dataentryfine
 * @fires InputChannel#event:rpn-databuttonincrement
 * @fires InputChannel#event:rpn-databuttondecrement
 *
 * @extends EventEmitter
 * @license Apache-2.0
 * @since 3.0.0
 */class l extends e{constructor(e,t){super(),this._input=e,this._number=t,this._octaveOffset=0,this._nrpnBuffer=[],this._rpnBuffer=[],this.parameterNumberEventsEnabled=!0,this.notesState=new Array(128).fill(!1);}destroy(){this._input=null,this._number=null,this._octaveOffset=0,this._nrpnBuffer=[],this.notesState=new Array(128).fill(!1),this.parameterNumberEventsEnabled=!1,this.removeListener();}_processMidiMessageEvent(e){const t=Object.assign({},e);t.port=this.input,t.target=this,t.type="midimessage",this.emit(t.type,t),this._parseEventForStandardMessages(t);}_parseEventForStandardMessages(e){const t=Object.assign({},e);t.type=t.message.type||"unknownmessage";const n=e.message.dataBytes[0],a=e.message.dataBytes[1];if("noteoff"===t.type||"noteon"===t.type&&0===a)this.notesState[n]=!1,t.type="noteoff",t.note=new s(r.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+d.octaveOffset),{rawAttack:0,rawRelease:a}),t.value=r.from7bitToFloat(a),t.rawValue=a,t.velocity=t.note.release,t.rawVelocity=t.note.rawRelease;else if("noteon"===t.type)this.notesState[n]=!0,t.note=new s(r.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+d.octaveOffset),{rawAttack:a}),t.value=r.from7bitToFloat(a),t.rawValue=a,t.velocity=t.note.attack,t.rawVelocity=t.note.rawAttack;else if("keyaftertouch"===t.type)t.note=new s(r.offsetNumber(n,this.octaveOffset+this.input.octaveOffset+d.octaveOffset)),t.value=r.from7bitToFloat(a),t.rawValue=a,t.identifier=t.note.identifier,t.key=t.note.number,t.rawKey=n;else if("controlchange"===t.type){t.controller={number:n,name:r.getCcNameByNumber(n)},t.subtype=t.controller.name||"controller"+n,t.value=r.from7bitToFloat(a),t.rawValue=a;const e=Object.assign({},t);e.type=`${t.type}-controller${n}`,delete e.subtype,this.emit(e.type,e),t.message.dataBytes[0]>=120&&this._parseChannelModeMessage(t),this.parameterNumberEventsEnabled&&this._isRpnOrNrpnController(t.message.dataBytes[0])&&this._parseEventForParameterNumber(t);}else "programchange"===t.type?(t.value=n,t.rawValue=t.value):"channelaftertouch"===t.type?(t.value=r.from7bitToFloat(n),t.rawValue=n):"pitchbend"===t.type?(t.value=((a<<7)+n-8192)/8192,t.rawValue=(a<<7)+n):t.type="unknownmessage";this.emit(t.type,t);}_parseChannelModeMessage(e){const t=Object.assign({},e);t.type=t.controller.name,"localcontrol"===t.type&&(t.value=127===t.message.data[2],t.rawValue=t.message.data[2]),"omnimodeon"===t.type?(t.type="omnimode",t.value=!0,t.rawValue=t.message.data[2]):"omnimodeoff"===t.type&&(t.type="omnimode",t.value=!1,t.rawValue=t.message.data[2]),"monomodeon"===t.type?(t.type="monomode",t.value=!0,t.rawValue=t.message.data[2]):"polymodeon"===t.type&&(t.type="monomode",t.value=!1,t.rawValue=t.message.data[2]),this.emit(t.type,t);}_parseEventForParameterNumber(e){const t=e.message.dataBytes[0],s=e.message.dataBytes[1],r=n.MIDI_CONTROL_CHANGE_MESSAGES;t===r.nonregisteredparameterfine||t===r.registeredparameterfine?(this._nrpnBuffer=[],this._rpnBuffer=[],t===r.nonregisteredparameterfine?this._nrpnBuffer=[e.message]:127!==s&&(this._rpnBuffer=[e.message])):t===r.nonregisteredparametercoarse||t===r.registeredparametercoarse?t===r.nonregisteredparametercoarse?(this._rpnBuffer=[],1===this._nrpnBuffer.length?this._nrpnBuffer.push(e.message):this._nrpnBuffer=[]):(this._nrpnBuffer=[],1===this._rpnBuffer.length&&127!==s?this._rpnBuffer.push(e.message):this._rpnBuffer=[]):t!==r.dataentrycoarse&&t!==r.dataentryfine&&t!==r.databuttonincrement&&t!==r.databuttondecrement||(2===this._rpnBuffer.length?this._dispatchParameterNumberEvent("rpn",this._rpnBuffer[0].dataBytes[1],this._rpnBuffer[1].dataBytes[1],e):2===this._nrpnBuffer.length?this._dispatchParameterNumberEvent("nrpn",this._nrpnBuffer[0].dataBytes[1],this._nrpnBuffer[1].dataBytes[1],e):(this._nrpnBuffer=[],this._rpnBuffer=[]));}_isRpnOrNrpnController(e){return e===n.MIDI_CONTROL_CHANGE_MESSAGES.dataentrycoarse||e===n.MIDI_CONTROL_CHANGE_MESSAGES.dataentryfine||e===n.MIDI_CONTROL_CHANGE_MESSAGES.databuttonincrement||e===n.MIDI_CONTROL_CHANGE_MESSAGES.databuttondecrement||e===n.MIDI_CONTROL_CHANGE_MESSAGES.nonregisteredparametercoarse||e===n.MIDI_CONTROL_CHANGE_MESSAGES.nonregisteredparameterfine||e===n.MIDI_CONTROL_CHANGE_MESSAGES.registeredparametercoarse||e===n.MIDI_CONTROL_CHANGE_MESSAGES.registeredparameterfine}_dispatchParameterNumberEvent(e,t,s,a){e="nrpn"===e?"nrpn":"rpn";const i={target:a.target,timestamp:a.timestamp,message:a.message,parameterMsb:t,parameterLsb:s,value:r.from7bitToFloat(a.message.dataBytes[1]),rawValue:a.message.dataBytes[1]};i.parameter="rpn"===e?Object.keys(n.MIDI_REGISTERED_PARAMETERS).find(e=>n.MIDI_REGISTERED_PARAMETERS[e][0]===t&&n.MIDI_REGISTERED_PARAMETERS[e][1]===s):(t<<7)+s;const o=r.getPropertyByValue(n.MIDI_CONTROL_CHANGE_MESSAGES,a.message.dataBytes[0]);i.type=`${e}-${o}`,this.emit(i.type,i),i.type=e,i.subtype=o,this.emit(i.type,i);}getChannelModeByNumber(e){return d.validation&&(console.warn("The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class."),e=Math.floor(e)),r.getChannelModeByNumber(e)}getCcNameByNumber(e){if(d.validation&&(console.warn("The 'getCcNameByNumber()' method has been moved to the 'Utilities' class."),!((e=parseInt(e))>=0&&e<=127)))throw new RangeError("Invalid control change number.");return r.getCcNameByNumber(e)}getNoteState(e){e instanceof s&&(e=e.identifier);const t=r.guessNoteNumber(e,d.octaveOffset+this.input.octaveOffset+this.octaveOffset);return this.notesState[t]}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e;}get input(){return this._input}get number(){return this._number}get nrpnEventsEnabled(){return this.parameterNumberEventsEnabled}set nrpnEventsEnabled(e){this.validation&&(e=!!e),this.parameterNumberEventsEnabled=e;}}
/**
 * The `Message` class represents a single MIDI message. It has several properties that make it
 * easy to make sense of the binary data it contains.
 *
 * @license Apache-2.0
 * @since 3.0.0
 */class h{constructor(e){this.rawData=e,this.data=Array.from(this.rawData),this.statusByte=this.rawData[0],this.rawDataBytes=this.rawData.slice(1),this.dataBytes=this.data.slice(1),this.isChannelMessage=!1,this.isSystemMessage=!1,this.command=void 0,this.channel=void 0,this.manufacturerId=void 0,this.type=void 0,this.statusByte<240?(this.isChannelMessage=!0,this.command=this.statusByte>>4,this.channel=1+(15&this.statusByte)):(this.isSystemMessage=!0,this.command=this.statusByte),this.isChannelMessage?this.type=r.getPropertyByValue(n.MIDI_CHANNEL_MESSAGES,this.command):this.isSystemMessage&&(this.type=r.getPropertyByValue(n.MIDI_SYSTEM_MESSAGES,this.command)),this.statusByte===n.MIDI_SYSTEM_MESSAGES.sysex&&(0===this.dataBytes[0]?(this.manufacturerId=this.dataBytes.slice(0,3),this.dataBytes=this.dataBytes.slice(3,this.rawDataBytes.length-1),this.rawDataBytes=this.rawDataBytes.slice(3,this.rawDataBytes.length-1)):(this.manufacturerId=[this.dataBytes[0]],this.dataBytes=this.dataBytes.slice(1,this.dataBytes.length-1),this.rawDataBytes=this.rawDataBytes.slice(1,this.rawDataBytes.length-1)));}}
/**
 * The `Input` class represents a single MIDI input port. This object is automatically instantiated
 * by the library according to the host's MIDI subsystem and does not need to be directly
 * instantiated. Instead, you can access all `Input` objects by referring to the
 * [`WebMidi.inputs`](WebMidi#inputs) array. You can also retrieve inputs by using methods such as
 * [`WebMidi.getInputByName()`](WebMidi#getInputByName) and
 * [`WebMidi.getInputById()`](WebMidi#getInputById).
 *
 * Note that a single MIDI device may expose several inputs and/or outputs.
 *
 * **Important**: the `Input` class does not directly fire channel-specific MIDI messages
 * (such as [`noteon`](InputChannel#event:noteon) or
 * [`controlchange`](InputChannel#event:controlchange), etc.). The [`InputChannel`](InputChannel)
 * object does that. However, you can still use the
 * [`Input.addListener()`](#addListener) method to listen to channel-specific events on multiple
 * [`InputChannel`](InputChannel) objects at once.
 *
 * @fires Input#opened
 * @fires Input#disconnected
 * @fires Input#closed
 * @fires Input#midimessage
 *
 * @fires Input#sysex
 * @fires Input#timecode
 * @fires Input#songposition
 * @fires Input#songselect
 * @fires Input#tunerequest
 * @fires Input#clock
 * @fires Input#start
 * @fires Input#continue
 * @fires Input#stop
 * @fires Input#activesensing
 * @fires Input#reset
 *
 * @fires Input#unknownmidimessage
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */class c extends e{constructor(e){super(),this._midiInput=e,this._octaveOffset=0,this.channels=[];for(let e=1;e<=16;e++)this.channels[e]=new l(this,e);this._forwarders=[],this._midiInput.onstatechange=this._onStateChange.bind(this),this._midiInput.onmidimessage=this._onMidiMessage.bind(this);}async destroy(){this.removeListener(),this.channels.forEach(e=>e.destroy()),this.channels=[],this._forwarders=[],this._midiInput&&(this._midiInput.onstatechange=null,this._midiInput.onmidimessage=null),await this.close(),this._midiInput=null;}_onStateChange(e){let t={timestamp:d.time,target:this,port:this};"open"===e.port.connection?(t.type="opened",this.emit("opened",t)):"closed"===e.port.connection&&"connected"===e.port.state?(t.type="closed",this.emit("closed",t)):"closed"===e.port.connection&&"disconnected"===e.port.state?(t.type="disconnected",t.port={connection:e.port.connection,id:e.port.id,manufacturer:e.port.manufacturer,name:e.port.name,state:e.port.state,type:e.port.type},this.emit("disconnected",t)):"pending"===e.port.connection&&"disconnected"===e.port.state||console.warn("This statechange event was not caught: ",e.port.connection,e.port.state);}_onMidiMessage(e){const t=new h(e.data),n={port:this,target:this,message:t,timestamp:e.timeStamp,type:"midimessage",data:t.data,rawData:t.data,statusByte:t.data[0],dataBytes:t.dataBytes};this.emit("midimessage",n),t.isSystemMessage?this._parseEvent(n):t.isChannelMessage&&this.channels[t.channel]._processMidiMessageEvent(n),this._forwarders.forEach(e=>e.forward(t));}_parseEvent(e){const t=Object.assign({},e);t.type=t.message.type||"unknownmidimessage","songselect"===t.type&&(t.song=e.data[1]+1,t.value=e.data[1],t.rawValue=t.value),this.emit(t.type,t);}async open(){try{await this._midiInput.open();}catch(e){return Promise.reject(e)}return Promise.resolve(this)}async close(){if(!this._midiInput)return Promise.resolve(this);try{await this._midiInput.close();}catch(e){return Promise.reject(e)}return Promise.resolve(this)}getChannelModeByNumber(){d.validation&&console.warn("The 'getChannelModeByNumber()' method has been moved to the 'Utilities' class.");}addListener(e,t,s={}){if(d.validation&&"function"==typeof s){let e=null!=t?[].concat(t):void 0;t=s,s={channels:e};}if(n.CHANNEL_EVENTS.includes(e)){void 0===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS);let a=[];return r.sanitizeChannels(s.channels).forEach(n=>{a.push(this.channels[n].addListener(e,t,s));}),a}return super.addListener(e,t,s)}addOneTimeListener(e,t,n={}){return n.remaining=1,this.addListener(e,t,n)}on(e,t,n,s){return this.addListener(e,t,n,s)}hasListener(e,t,s={}){if(d.validation&&"function"==typeof s){let e=[].concat(t);t=s,s={channels:e};}return n.CHANNEL_EVENTS.includes(e)?(void 0===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),r.sanitizeChannels(s.channels).every(n=>this.channels[n].hasListener(e,t))):super.hasListener(e,t)}removeListener(e,t,s={}){if(d.validation&&"function"==typeof s){let e=[].concat(t);t=s,s={channels:e};}if(void 0===s.channels&&(s.channels=n.MIDI_CHANNEL_NUMBERS),null==e)return r.sanitizeChannels(s.channels).forEach(e=>{this.channels[e]&&this.channels[e].removeListener();}),super.removeListener();n.CHANNEL_EVENTS.includes(e)?r.sanitizeChannels(s.channels).forEach(n=>{this.channels[n].removeListener(e,t,s);}):super.removeListener(e,t,s);}addForwarder(e,t={}){let n;return n=e instanceof o?e:new o(e,t),this._forwarders.push(n),n}removeForwarder(e){this._forwarders=this._forwarders.filter(t=>t!==e);}hasForwarder(e){return this._forwarders.includes(e)}get name(){return this._midiInput.name}get id(){return this._midiInput.id}get connection(){return this._midiInput.connection}get manufacturer(){return this._midiInput.manufacturer}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e;}get state(){return this._midiInput.state}get type(){return this._midiInput.type}get nrpnEventsEnabled(){return d.validation&&console.warn("The 'nrpnEventsEnabled' property has been moved to the 'InputChannel' class."),!1}}
/**
 * The `WebMidi` object makes it easier to work with the low-level Web MIDI API. Basically, it
 * simplifies sending outgoing MIDI messages and reacting to incoming MIDI messages.
 *
 * When using the WebMidi.js library, you should know that the `WebMidi` class has already been
 * instantiated. You cannot instantiate it yourself. If you use the **IIFE** version, you should
 * simply use the global object called `WebMidi`. If you use the **CJS** (CommonJS) or **ESM** (ES6
 * module) version, you get an already-instantiated object when you import the module.
 *
 * @fires WebMidi#connected
 * @fires WebMidi#disabled
 * @fires WebMidi#disconnected
 * @fires WebMidi#enabled
 * @fires WebMidi#error
 * @fires WebMidi#midiaccessgranted
 * @fires WebMidi#portschanged
 *
 * @extends EventEmitter
 * @license Apache-2.0
 */const d=new class extends e{constructor(){super(),this.defaults={note:{attack:r.from7bitToFloat(64),release:r.from7bitToFloat(64),duration:1/0}},this.interface=null,this.validation=!0,this._inputs=[],this._disconnectedInputs=[],this._outputs=[],this._disconnectedOutputs=[],this._stateChangeQueue=[],this._octaveOffset=0;}async enable(e={},t=!1){if(r.isNode){try{window.navigator;}catch(e){global.navigator=await Object.getPrototypeOf((async function(){})).constructor('\n        let jzz = await import("jzz");\n        return jzz.default;\n        ')();}try{performance;}catch(e){global.performance=await Object.getPrototypeOf((async function(){})).constructor('\n        let perf_hooks = await import("perf_hooks");\n        return perf_hooks.performance;\n        ')();}}if(this.validation=!1!==e.validation,this.validation&&("function"==typeof e&&(e={callback:e,sysex:t}),t&&(e.sysex=!0)),this.enabled)return "function"==typeof e.callback&&e.callback(),Promise.resolve();const n={timestamp:this.time,target:this,type:"error",error:void 0},s={timestamp:this.time,target:this,type:"midiaccessgranted"},a={timestamp:this.time,target:this,type:"enabled"};try{"function"==typeof e.requestMIDIAccessFunction?this.interface=await e.requestMIDIAccessFunction({sysex:e.sysex,software:e.software}):this.interface=await navigator.requestMIDIAccess({sysex:e.sysex,software:e.software});}catch(t){return n.error=t,this.emit("error",n),"function"==typeof e.callback&&e.callback(t),Promise.reject(t)}this.emit("midiaccessgranted",s),this.interface.onstatechange=this._onInterfaceStateChange.bind(this);try{await this._updateInputsAndOutputs();}catch(t){return n.error=t,this.emit("error",n),"function"==typeof e.callback&&e.callback(t),Promise.reject(t)}return this.emit("enabled",a),"function"==typeof e.callback&&e.callback(),Promise.resolve(this)}async disable(){return this._destroyInputsAndOutputs().then(()=>{navigator&&"function"==typeof navigator.close&&navigator.close(),this.interface&&(this.interface.onstatechange=void 0),this.interface=null;let e={timestamp:this.time,target:this,type:"disabled"};this.emit("disabled",e),this.removeListener();})}getInputById(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return}if(t.disconnected){for(let t=0;t<this._disconnectedInputs.length;t++)if(this._disconnectedInputs[t].id===e.toString())return this._disconnectedInputs[t]}else for(let t=0;t<this.inputs.length;t++)if(this.inputs[t].id===e.toString())return this.inputs[t]}getInputByName(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return;e=e.toString();}if(t.disconnected){for(let t=0;t<this._disconnectedInputs.length;t++)if(~this._disconnectedInputs[t].name.indexOf(e))return this._disconnectedInputs[t]}else for(let t=0;t<this.inputs.length;t++)if(~this.inputs[t].name.indexOf(e))return this.inputs[t]}getOutputByName(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return;e=e.toString();}if(t.disconnected){for(let t=0;t<this._disconnectedOutputs.length;t++)if(~this._disconnectedOutputs[t].name.indexOf(e))return this._disconnectedOutputs[t]}else for(let t=0;t<this.outputs.length;t++)if(~this.outputs[t].name.indexOf(e))return this.outputs[t]}getOutputById(e,t={disconnected:!1}){if(this.validation){if(!this.enabled)throw new Error("WebMidi is not enabled.");if(!e)return}if(t.disconnected){for(let t=0;t<this._disconnectedOutputs.length;t++)if(this._disconnectedOutputs[t].id===e.toString())return this._disconnectedOutputs[t]}else for(let t=0;t<this.outputs.length;t++)if(this.outputs[t].id===e.toString())return this.outputs[t]}noteNameToNumber(e){return this.validation&&console.warn("The noteNameToNumber() method is deprecated. Use Utilities.toNoteNumber() instead."),r.toNoteNumber(e,this.octaveOffset)}getOctave(e){return this.validation&&(console.warn("The getOctave()is deprecated. Use Utilities.getNoteDetails() instead"),e=parseInt(e)),!isNaN(e)&&e>=0&&e<=127&&r.getNoteDetails(r.offsetNumber(e,this.octaveOffset)).octave}sanitizeChannels(e){return this.validation&&console.warn("The sanitizeChannels() method has been moved to the utilities class."),r.sanitizeChannels(e)}toMIDIChannels(e){return this.validation&&console.warn("The toMIDIChannels() method has been deprecated. Use Utilities.sanitizeChannels() instead."),r.sanitizeChannels(e)}guessNoteNumber(e){return this.validation&&console.warn("The guessNoteNumber() method has been deprecated. Use Utilities.guessNoteNumber() instead."),r.guessNoteNumber(e,this.octaveOffset)}getValidNoteArray(e,t={}){return this.validation&&console.warn("The getValidNoteArray() method has been moved to the Utilities.buildNoteArray()"),r.buildNoteArray(e,t)}convertToTimestamp(e){return this.validation&&console.warn("The convertToTimestamp() method has been moved to Utilities.toTimestamp()."),r.toTimestamp(e)}async _destroyInputsAndOutputs(){let e=[];return this.inputs.forEach(t=>e.push(t.destroy())),this.outputs.forEach(t=>e.push(t.destroy())),Promise.all(e).then(()=>{this._inputs=[],this._outputs=[];})}_onInterfaceStateChange(e){this._updateInputsAndOutputs();let t={timestamp:e.timeStamp,type:e.port.state,target:this};if("connected"===e.port.state&&"open"===e.port.connection){"output"===e.port.type?t.port=this.getOutputById(e.port.id):"input"===e.port.type&&(t.port=this.getInputById(e.port.id)),this.emit(e.port.state,t);const n=Object.assign({},t);n.type="portschanged",this.emit(n.type,n);}else if("disconnected"===e.port.state&&"pending"===e.port.connection){"input"===e.port.type?t.port=this.getInputById(e.port.id,{disconnected:!0}):"output"===e.port.type&&(t.port=this.getOutputById(e.port.id,{disconnected:!0})),this.emit(e.port.state,t);const n=Object.assign({},t);n.type="portschanged",this.emit(n.type,n);}}async _updateInputsAndOutputs(){return Promise.all([this._updateInputs(),this._updateOutputs()])}async _updateInputs(){if(!this.interface)return;for(let e=this._inputs.length-1;e>=0;e--){const t=this._inputs[e];Array.from(this.interface.inputs.values()).find(e=>e===t._midiInput)||(this._disconnectedInputs.push(t),this._inputs.splice(e,1));}let e=[];return this.interface.inputs.forEach(t=>{if(!this._inputs.find(e=>e._midiInput===t)){let n=this._disconnectedInputs.find(e=>e._midiInput===t);n||(n=new c(t)),this._inputs.push(n),e.push(n.open());}}),Promise.all(e)}async _updateOutputs(){if(!this.interface)return;for(let e=this._outputs.length-1;e>=0;e--){const t=this._outputs[e];Array.from(this.interface.outputs.values()).find(e=>e===t._midiOutput)||(this._disconnectedOutputs.push(t),this._outputs.splice(e,1));}let e=[];return this.interface.outputs.forEach(t=>{if(!this._outputs.find(e=>e._midiOutput===t)){let n=this._disconnectedOutputs.find(e=>e._midiOutput===t);n||(n=new i(t)),this._outputs.push(n),e.push(n.open());}}),Promise.all(e)}get enabled(){return null!==this.interface}get inputs(){return this._inputs}get isNode(){return this.validation&&console.warn("WebMidi.isNode has been deprecated. Use Utilities.isNode instead."),r.isNode}get isBrowser(){return this.validation&&console.warn("WebMidi.isBrowser has been deprecated. Use Utilities.isBrowser instead."),r.isBrowser}get octaveOffset(){return this._octaveOffset}set octaveOffset(e){if(this.validation&&(e=parseInt(e),isNaN(e)))throw new TypeError("The 'octaveOffset' property must be an integer.");this._octaveOffset=e;}get outputs(){return this._outputs}get supported(){return "undefined"!=typeof navigator&&navigator.requestMIDIAccess}get sysexEnabled(){return !(!this.interface||!this.interface.sysexEnabled)}get time(){return performance.now()}get version(){return "3.0.21"}get CHANNEL_EVENTS(){return this.validation&&console.warn("The CHANNEL_EVENTS enum has been moved to Enumerations.CHANNEL_EVENTS."),n.CHANNEL_EVENTS}get MIDI_SYSTEM_MESSAGES(){return this.validation&&console.warn("The MIDI_SYSTEM_MESSAGES enum has been moved to Enumerations.MIDI_SYSTEM_MESSAGES."),n.MIDI_SYSTEM_MESSAGES}get MIDI_CHANNEL_MODE_MESSAGES(){return this.validation&&console.warn("The MIDI_CHANNEL_MODE_MESSAGES enum has been moved to Enumerations.MIDI_CHANNEL_MODE_MESSAGES."),n.MIDI_CHANNEL_MODE_MESSAGES}get MIDI_CONTROL_CHANGE_MESSAGES(){return this.validation&&console.warn("The MIDI_CONTROL_CHANGE_MESSAGES enum has been moved to Enumerations.MIDI_CONTROL_CHANGE_MESSAGES."),n.MIDI_CONTROL_CHANGE_MESSAGES}get MIDI_REGISTERED_PARAMETER(){return this.validation&&console.warn("The MIDI_REGISTERED_PARAMETER enum has been moved to Enumerations.MIDI_REGISTERED_PARAMETERS."),this.MIDI_REGISTERED_PARAMETERS}get NOTES(){return this.validation&&console.warn("The NOTES enum has been deprecated."),["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]}};d.constructor=null;

// Source from <https://github.com/mat1jaczyyy/apollo-studio/blob/master/Apollo/Structures/Color.cs>.

/**
 * Converts an RGB color value to HSV.
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);

  let hue = 0;
  if (max != min) {
    let diff = max - min;

    if (max == r) {
      hue = (g - b) / diff;
    } else if (max == g) {
      hue = (b - r) / diff + 2.0;
    } else if (max == b) {
      hue = (r - g) / diff + 4.0;
    }
    if (hue < 0) hue += 6.0;
  }
  
  let saturation = 0;
  if (max != 0) saturation = 1 - (min / max);

  return [hue * 60, saturation, max];
}

const getUIColor = (color) => {
  let [h, s, val] = rgbToHsv(...color);
  s = Math.pow(s, 1.8);
  val = Math.pow(val, 1 / 4.5);
  
  let fr, fg, fb;
  
  h /= 60;
  
  let hi = Math.floor(h) % 6;
  let f = h - Math.floor(h);
  val *= 255;
  
  let v = val;
  let p = val * (1 - s);
  let q = val * (1 - f * s);
  let t = val * (1 - (1 - f) * s);
  
  if (hi == 0)      [fr, fg, fb] = [v, t, p];
  else if (hi == 1) [fr, fg, fb] = [q, v, p];
  else if (hi == 2) [fr, fg, fb] = [p, v, t];
  else if (hi == 3) [fr, fg, fb] = [p, q, v];
  else if (hi == 4) [fr, fg, fb] = [t, p, v];
  else              [fr, fg, fb] = [v, p, q];
 
  let max = Math.max(fr, fg, fb) / 255;
  let bg = {
    R: DEFAULT_RGB_UI_PAD[0],
    G: DEFAULT_RGB_UI_PAD[1],
    B: DEFAULT_RGB_UI_PAD[2]
  };
  
  const new_color = [
    Math.round((fr * max + bg.R * (1 - max))),
    Math.round((fg * max + bg.G * (1 - max))),
    Math.round((fb * max + bg.B * (1 - max)))
  ];
  
  return new_color;
};

/** @param {ArrayBuffer} file */
const midiFileParser = async (file) => {
  const midiObject = new Midi(file);

  // Parse the notes.
  const midi_data = midiObject.toJSON();
  /** Notes of the first track of the MIDI file. */
  const notes_data = midi_data.tracks[0].notes;

  /**
   * Here, we group the notes by time to setup the
   * setTimeouts for each group, when needed to.
   */
  const grouped_notes = [];

  /**
   * Delay in MS. Kind of a "hack" to prevent pads from blinking.
   * TODO: Make it configurable.
   */
  const delay = 20;

  // Group the notes by time.
  notes_data.forEach(note => {
    const start_time = note.time * 1000;
    const duration = (note.duration * 1000) + delay;

    const convert_results = convertNoteLayout(note.midi, "drum_rack", "programmer");
    if (!convert_results.success) return;

    const colorFromPalette = novationLaunchpadPalette[note.velocity * 127];

    const parsed_noteon = {
      index: convert_results.note,
      duration,
      color: colorFromPalette,
      uiColor: getUIColor(colorFromPalette)
    };
    
    // const parsed_noteoff = {
    //   index: convert_results.note,
    //   duration: 0,
    //   color: [0, 0, 0]
    // };

    const group_on = grouped_notes.find(
      group => group.start_time === start_time
    );

    // const group_off = grouped_notes.find(
    //   group => group.start_time === start_time + duration
    // );

    if (!group_on) {
      grouped_notes.push({
        start_time,
        notes: [parsed_noteon]
      });
    } else group_on.notes.push(parsed_noteon);

    // if (!group_off) {
    //   grouped_notes.push({
    //     start_time: start_time + duration,
    //     notes: [parsed_noteoff]
    //   });
    // } else group_off.notes.push(parsed_noteoff);
  });

  return grouped_notes;
};

const https = window.require("https");

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

          const zip = await JSZip.loadAsync(uint8Array);
          
          const infos_file = await zip.file("infos.json")?.async("string");
          const midi_file = await zip.file("effect.mid")?.async("arraybuffer");

          if (!infos_file || !midi_file) {
            console.error(`[${pkg.className}] Invalid DLPE file: missing infos.json or effect.mid. Aborting.`);
            this.setState({ hasError: true });
            return;
          }

          const infos_parsed = JSON.parse(infos_file);
          const midi_parsed = await midiFileParser(midi_file);

          this.setState({ loaded: true, midi: midi_parsed, infos: infos_parsed });
      });
    });
  }

  render () {
    if (this.state.hasError) return this.props.originalChildren;
    const deviceOutput = () => {
      const loaded_id = BDFDB.DataUtils.load(pkg.className, "output");
      const loaded_type = BDFDB.DataUtils.load(pkg.className, "type");

      if (typeof loaded_id === "string" && typeof loaded_type === "string") return {
        output: d.outputs.find(output => output.id === loaded_id),
        type: loaded_type
      }

      return null;
    };

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
    };

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

const PATCH_CODE = `
// _WEBMIDI_PATCH_START_
const { app, session, ipcMain } = require("electron");
app.once("ready", () => {
  const allowedHostnames = ["discord.com", "canary.discord.com", "ptb.discord.com"];
  const allowedPermissions = ['notifications', 'fullscreen', 'pointerLock', 'midi', 'midiSysex', 'accessibility-events'];
  
  const isAllowed = (requestingUrl, permission, sync) => {
    const requestingHostname = new URL(requestingUrl).hostname;
    console.log(\`[WebMidiInjector] (\${(sync) ? "sync" : "async"}) \${permission}-Permission Requested by \${requestingHostname}\`);
    const allowed = allowedHostnames.includes(requestingHostname) && allowedPermissions.includes(permission);
    console.log(\`[WebMidiInjector] (\${(sync) ? "sync" : "async"}) \${permission}-Permission\`, (allowed) ? "Granted" : "Denied");
    return allowed;
  }

  ipcMain.on("_WEBMIDI_LOAD_", () => {
    console.log("[WebMidiInjector] Loaded");
    // Async Handler
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback, details) => {
      callback(isAllowed(details.requestingUrl, permission, false));
    }); 
    // Sync Handler
    session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
      return isAllowed(requestingOrigin, permission, true);
    });
  });
});
// _WEBMIDI_PATCH_END_
`;

const { resourcesPath } = window.require("process");
const fs = window.require("fs");

/** @type {() => string} */
const getAppFileCode = () => fs.readFileSync(`${resourcesPath}/app/index.js`, { encoding: "utf8" });

const checkMidiPermissionsInjector = () => {
  /** @type {string} */
  const appFileCode = getAppFileCode();
  const hasPatched = appFileCode.includes("_WEBMIDI_PATCH_START_") && appFileCode.includes("_WEBMIDI_PATCH_END_");
  if (!hasPatched) return "unpatched";

  const codeInjected = appFileCode.substring(
    appFileCode.indexOf("// _WEBMIDI_PATCH_START_"),
    appFileCode.indexOf("_WEBMIDI_PATCH_END_") + "_WEBMIDI_PATCH_END_".length
  );

  if (codeInjected.trim() !== PATCH_CODE.trim()) return "outdated";

  return "patched";
};

const injectMidiPermissions = () => {
  console.log("[WebMidiInjector] Injecting MIDI permissions...");
  
  const appFileCode = getAppFileCode();
  const appFileCodePatched = appFileCode + PATCH_CODE;
  
  // Write the patched file back to the app folder.
  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodePatched);

  console.log("[WebMidiInjector] Injected new MIDI permissions ! Please, restart BetterDiscord.");
  BdApi.showConfirmationModal(
    "Injected new MIDI permissions",
    `Please restart BetterDiscord to load them. Without them, the plugin "${pkg.className}" won't work.`, {
    confirmText: "Restart BD",
    onConfirm: () => {
      DiscordNative.app.relaunch();
    },

    cancelText: "Cancel",
    onCancel: () => undefined
  });
};

const removeMidiPermissions = () => {
  console.log("[WebMidiInjector] Removing MIDI permissions...");
  
  const appFileCode = getAppFileCode();
  const appFileCodeCleaned = appFileCode.substring(
    0, appFileCode.indexOf("\n// _WEBMIDI_PATCH_START_")
  );

  fs.writeFileSync(`${resourcesPath}/app/index.js`, appFileCodeCleaned);
  console.log("[WebMidiInjector] Removed MIDI permissions.");
};

const { ipcRenderer } = window.require("electron");

const config = {
  "info": {
    "name": pkg.className,
    "author": pkg.author.name,
    "version": pkg.version,
    "description": pkg.description
  }
};

var DiscordLaunchpadMIDILightEffectViewer = (([Plugin, BDFDB]) => {
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
          files.filter(({ file }) => !file.name.endsWith(".mid"));

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
      // const AttachmentModule = BdApi.findModule(
      //   (m) => m.default?.displayName === "Attachment"
      // );

      const MessageAttachmentModule = BdApi.findModule(
        (m) => m.default?.displayName === "MessageAttachment"
      );

      // const cleanAttachmentPatch = BdApi.monkeyPatch(AttachmentModule, "default", {
      //   after: ({ returnValue }) => {
      //     if (
      //       returnValue.props?.children?.length === 0 ||
      //       !returnValue.props.children[0]?.props?.children.length === 0 ||
      //       !returnValue.props.children[0]?.props?.children[2]?.props.href
      //     ) return;

          
      //     console.log(returnValue);
      //     return;

      //     const fileUrl = returnValue.props.children[0]?.props?.children[2]?.props.href;
      //     if (!fileUrl.toLowerCase().endsWith(".dlpe.zip")) return;

      //     const originalChildren = [...returnValue.props.children];
      //     returnValue.props.children[0].props.children = [
      //       BDFDB.ReactUtils.createElement(DlpeAttachment, {
      //         url: fileUrl,
      //         originalChildren
      //       })
      //     ];
      //   }
      // });

      const cleanAttachmentPatch = BdApi.monkeyPatch(MessageAttachmentModule, "default", {
        after: ({ returnValue }) => {
          const fileUrl = returnValue?.props?.children?.props?.attachment?.url;
          if (!fileUrl.toLowerCase().endsWith(".dlpe.zip")) return;

          const originalChildren = { ...returnValue.props.children };
          returnValue.props.children = [
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
      await d.enable({ sysex: true });
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
                options: d.outputs.map(output => ({
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

var index = (() => isMissingLibrary() ? MissingLibraryLoader : DiscordLaunchpadMIDILightEffectViewer)();

module.exports = index;