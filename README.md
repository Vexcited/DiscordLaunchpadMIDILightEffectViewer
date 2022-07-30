# BetterDiscord - DiscordLaunchpadMIDILightEffectViewer

> A BetterDiscord plugin that allows preview of Launchpad light effects inside Discord via WebMIDI injection and stuff like that.

## Installation

Drag the `discord-launchpad-midi-light-effect-viewer.plugin.js` from the release folder to your BetterDiscord plugins folder.

When the plugin loads, you'll get a modal showing that the MIDI permissions for the plugin to work has been injected. To finish the injection, restart Discord. When you press the `Restart BD` button, it sometimes show a crash log saying the app crashed. It's normal, it's just a easy way to restart BetterDiscord lol.

Now, check in your settings that the plugin is enabled.

## Settings

> Still in development

## Usage

> Still in development

## Development

All the plugin's code is located in the `src` directory. To bundle this all into one JS file, I use `rollup`.

Make sure the dependencies are installed with `pnpm install` (yes use `pnpm`) and start the build script with `pnpm build`. This will create the new build in `release/discord-launchpad-midi-light-effect-viewer.plugin.js` that you can move to your BetterDiscord plugins directory.