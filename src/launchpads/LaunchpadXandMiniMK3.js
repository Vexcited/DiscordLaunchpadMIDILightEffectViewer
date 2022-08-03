import { devicesConfiguration } from "../utils/devices";
import { DEFAULT_RGB_UI_PAD } from "../utils/palettes";

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

export default BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadXandMiniMK3, {
  innerRef: ref,
  ...props 
}));