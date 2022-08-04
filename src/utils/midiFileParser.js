import { convertNoteLayout } from "./layouts";
import { novationLaunchpadPalette } from "./palettes";
import { getUIColor } from "./colors";

export const checkIsNoteOff = (note) => {
  return note.color[0] === 0 && note.color[1] === 0 && note.color[2] === 0;
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

  // Cleanup the grouped notes.
  const cleanedGroupedNotes = [];

  // Check if a note is noteoff in the next group that it is currently on.
  for (const group of grouped_notes) {
    for (const note of group.notes) {
      if (checkIsNoteOff(note)) continue;

      const startTime = group.start_time;
      const startEnd = startTime + note.duration;

      const groupsWithinTheStartAndEnd = grouped_notes.filter(
        _group => _group.start_time > startTime && _group.start_time <= startEnd + delay 
      );

      let addNoteOff = true;
      
      for (const groupProfiled of groupsWithinTheStartAndEnd) {
        for (const noteProfiled of groupProfiled.notes) {
          // When we find a note on, remove the noteoff of the current note.
          if (noteProfiled.index === note.index && !checkIsNoteOff(noteProfiled)) {
            addNoteOff = false;
            console.log("lets not add", noteProfiled.index);
          }
        }
      }

      const group_on = cleanedGroupedNotes.find(
        group => group.start_time === startTime
      );
  
      const parsed_noteon = {
        index: note.index,
        color: note.color
      };
  
      if (!group_on) {
        cleanedGroupedNotes.push({
          start_time: startTime,
          notes: [parsed_noteon]
        });
      } else group_on.notes.push(parsed_noteon);
  
      if (addNoteOff) {
        const group_off = cleanedGroupedNotes.find(
          group => group.start_time === startEnd
        );

        const parsed_noteoff = {
          index: note.index,
          color: [0, 0, 0]
        };

        if (!group_off) {
          cleanedGroupedNotes.push({
            start_time: startEnd,
            notes: [parsed_noteoff]
          });
        } else group_off.notes.push(parsed_noteoff);
      }
    }
  }

  console.log(cleanedGroupedNotes, grouped_notes);
  return cleanedGroupedNotes;
}

export default midiFileParser;
