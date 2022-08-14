package com.github.vexcited

import android.content.Context

import com.aliucord.annotations.AliucordPlugin
import com.aliucord.entities.Plugin
import com.aliucord.Logger

@SuppressWarnings("unused")
@AliucordPlugin(requiresRestart = false)
class DiscordLaunchpadMIDILightEffectViewer : Plugin() {
  override fun start (context: Context) {
    val logger = Logger("DiscordLaunchpadMIDILightEffectViewer")
    logger.debug("Plugin have been started !")
  }

  override fun stop (context: Context) {

  }
}