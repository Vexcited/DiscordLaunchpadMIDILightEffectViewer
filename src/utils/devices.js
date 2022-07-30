import { layouts } from "./layouts";

/**
 * Most of the code right here is taken from
 * Vexcited's lpadder project.
 * 
 * You can see the original code here:
 * <https://github.com/Vexcited/lpadder/blob/main/src/utils/devices.ts>
 */

/** SysEx header for Novation devices. */
const SYSEX_HEADER_NOVATION = [0x00, 0x20, 0x29];

export const devicesConfiguration = {
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
      console.log(layout);

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
