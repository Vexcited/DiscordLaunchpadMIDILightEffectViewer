# DiscordLaunchpadMIDILightEffectViewer
A Discord plugin that allows preview of Launchpad light effects inside Discord via WebMIDI injection and stuff like that.

## Clients

You'll find the installation instruction in each of the branches' `README.md`.

- BetterDiscord: in the [`betterdiscord` branch](https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer/tree/betterdiscord).
  - **Status** - In active development.

- Powercord: in the [`powercord` branch](https://github.com/Vexcited/DiscordLaunchpadMIDILightEffectViewer/tree/powercord).
  - **Status** - In early development.

## Usage

The usage is the same for all clients. Drag or upload a `.mid` file into a text chat and a modal will appear.

Here, you'll be able to configure the light effect that you'll share. Optionally, you can also add audio to it.

When you have finished configuring your light effect, you can see a preview of it with the device you selected. When playing, it will also play the effect on the configured output in the plugin settings.

Now, you're ready to upload the effect! When selecting `Share light effect!`, instead of `.mid` file, you'll be uploading a `.dlpe` file (`dlpe` stands for `Discord LaunchPad Effect`).

<!-- If you have checked the `Also send a MP4 video preview` option, a `.mp4` file will also be included in the upload. -->

When sent, the file will be parsed by the plugin and instead of showing an empty embed to download the file, it will show a Launchpad with actions to play, pause, stop and more.

> TODO: More explanations in the future
