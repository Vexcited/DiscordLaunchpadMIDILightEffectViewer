import LaunchpadProMK2 from "./LaunchpadProMK2";
import LaunchpadMK2 from "./LaunchpadMK2";

export const LAUNCHPAD_REQUIRED_CSS = `
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

export default {
  LaunchpadProMK2,
  LaunchpadMK2
};
