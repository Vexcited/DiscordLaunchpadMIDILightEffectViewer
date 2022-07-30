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

export const layouts = {
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
export const convertNoteLayout = (note, from, to) => {
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
