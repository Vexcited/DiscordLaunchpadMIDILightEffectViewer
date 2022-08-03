import { devicesConfiguration } from "../utils/devices";
import { DEFAULT_RGB_UI_PAD } from "../utils/palettes";

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


export default BdApi.React.forwardRef((props, ref) => BDFDB.ReactUtils.createElement(LaunchpadProMK3, {
  innerRef: ref,
  ...props 
}));