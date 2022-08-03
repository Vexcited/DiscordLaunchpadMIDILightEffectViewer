import { convertNoteLayout } from "./layouts";
import { novationLaunchpadPalette } from "./palettes";

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
    const duration = (note.duration * 1000); // + delay;

    const convert_results = convertNoteLayout(note.midi, "drum_rack", "programmer");
    if (!convert_results.success) return;

    const parsed_noteon = {
      index: convert_results.note,
      color: novationLaunchpadPalette[note.velocity * 127],
    };

    const group_on = grouped_notes.find(
      group => group.start_time === start_time
    );

    if (!group_on) {
      grouped_notes.push({
        start_time,
        notes: [parsed_noteon]
      });

      return;
    }

    group_on.notes.push(parsed_noteon);

    const parsed_noteoff = {
      index: convert_results.note,
      color: [0, 0, 0]
    };

    const group_off = grouped_notes.find(
      group => group.start_time === start_time + duration
    );

    if (!group_off) {
      grouped_notes.push({
        start_time: start_time + duration,
        notes: [parsed_noteoff]
      });

      return;
    }

    group_off.notes.push(parsed_noteoff);
  });

  return grouped_notes;
}

export default midiFileParser;
