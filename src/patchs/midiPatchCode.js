export const PATCH_CODE = `
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
