---
title: "Installation"
linkTitle: "Installation"
weight: 20
description: >
  Installing the C&C Remastered extension into Vortex
---

## Quick Start

The fastest way to get started is to just open the Games page in Vortex and scroll down through the unmanaged games. You should see an entry for Ace Combat 7 Skies Unknown in there. Click Manage on that entry and follow the prompts to install the extension and restart Vortex. You should be good to go and try [installing some mods](/docs/usage/mods)!

![installation process][install_quick]

[install_quick]: /ac7_install.gif


## Installing the Extension

If the quick start doesn't work or you want to install the extension yourself, there's a couple of different ways to do that! Unless you've got a pretty specific use case, you'll probably want one of the two automatic methods, but manual installation is available as well.

### Automatic Installation

> This is the easiest way to install!

1. Open up Vortex, and open the Extensions panel from the left sidebar.
1. Click **Find more** to open the list of Extensions
1. Find **Ace Combat 7 Skies Unknown Support** and click *Install*
1. Wait for the extension to install and **restart Vortex** when prompted.

Once Vortex has restarted, just click the Manage button on Ace Combat 7 in your Games screen and you're ready to [install some mods](/docs/usage/mods)!

### Semi-Automatic Installation

If you can't install directly from the Extensions screen, you can instead install from the archive.

1. Download the archive from [Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files) or [GitHub](https://https://github.com/agc93/acevortex/releases)
1. Open the Extensions panel in Vortex
1. Click on the *Drop File(s)* box in the corner and locate the archive you downloaded.
1. Wait for the extension to install and **restart Vortex** when prompted.

Once Vortex has restarted, just click the Manage button on Ace Combat in your Games screen and you're ready to [install some mods](/docs/usage/mods)!

### Manual Installation

> Only attempt this if you *absolutely* have to. It becomes much harder to debug and much harder to upgrade.

If you want to install the extension yourself, you will have to install the actual extension files manually. Make sure you close Vortex before proceeding.

First, download the archive from [Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files) or [GitHub](https://https://github.com/agc93/acevortex/actions).

Next, unpack the archive to somewhere convenient. You should have a directory named `game-acecombat7skiesunknown` with at least three files inside:

- info.json
- index.js
- gameart.png

Now, copy the whole directory to your Vortex folder. You can easily open your Vortex folder by opening a new File Explorer window and entering the following in to the location bar: `%APPDATA%/Vortex` and then opening the `plugins` directory (create it if it doesn’t exist).

Once you’re done, you should have three files at the following locations:

```text
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-acecombat7skiesunknown\info.json
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-acecombat7skiesunknown\index.js
C:\Users\<your-user-name-here>\AppData\Roaming\Vortex\plugins\game-acecombat7skiesunknown\gameart.png
```

With those files in place, you're clear to start Vortex and you should see the C&C Remastered icon in the Games screen light up.