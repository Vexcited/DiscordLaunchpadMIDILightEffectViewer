version = "0.1.0"
description = "My first commands!"

aliucord {
    // Changelog of your plugin
    changelog.set("""
      This plugin is still in development but anyway, here we are, I guess... 
    """.trimIndent())
    // TODO: image or gif to show at the top of the changelog. 
    // changelogMedia.set("https://raw.githubusercontent.com/TODO.gifORpng")

    // Excludes this plugin from the updater, meaning it won't show up for users.
    excludeFromUpdaterJson.set(true)
}