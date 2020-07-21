---
title: "Configuration"
linkTitle: "Configuration"
weight: 30
description: >
  How to configure and customise your mods
---

### Customising metadata

You can customise the basic metadata of any of your mods (name, author, notes etc) using Vortex's built-in sidebar. Just double-click on the name of any mod in your mod list and you'll get a small dialog where you can change the name and author, or add some notes for yourself. It's not recommended to change the source or mod type as these control how mods are handled internally.

### Profiles

Just like any other Vortex game, you can have multiple profiles configured for different mod selections. Want an easier way to switch between certain sets of skins? Don't want to use all your wild skins every time you play? Set up profiles and you can easily switch between them to keep your mod installs separate. You can create a new profile from the Profiles screen by either cloning your exising one (from the Edit dropdown menu), or clicking *Add "Ace Combat 7: Skies Unknown" Profile*.

### Checking installed files

If you installed a mod using the guided installer, it's possible you only installed some `.pak` files from the original mod archive. If you need to check which files you installed for any reason, you can find them in the mod details panel. Double click the relevant mod in the Mods list and scroll down in the panel on the right to find out how many files you installed. Click on the summary (i.e. *2 installed files*) to see exactly which files you chose to isntall.

### Purging to default

If you want to take your game back to a default, unmodded state, you can use Vortex's *Purge* feature. Click the Purge Mods button from the Mods list and Vortex will undeploy all your enabled mods, leaving your game directory essentially unmodded. 

### Removing or resetting AceVortex

If you want to completely reset AceVortex so that you can start over from scratch, first uninstall all your currently installed mods from the Mods list. Once you've done that (and deployed!) jump to the Profiles screen, and choose *Remove* from the dropdown menu beside the edit button for the "**Ace Combat 7: Skies Unknown - Default**" profile. This will effectively reset your Vortex so that AC7 will reappear as an available, unmanaged game in the Games list.

To remove AceVortex entirely, you should uninstall and remove all your installed mods from the Mods list first. After deploying, you can then remove the Default profile (see above), and finally uninstall the extension itself by clicking over to the Extensions screen. AceVortex will appear near the end of the list as "**Game: Ace Combat 7: Skies Unknown**". Click Remove to uninstall AceVortex.

> Note that AC7 will still show up in your Games list since Vortex can redownload the extension from Nexus Mods.

### Multiple Installation Variants

If you don't like the specific skin/slot choices you made when you installed one of your mods, remember that you can always reinstall the mod and use Vortex's *variant* functionality to easily switch between multiple versions of the same mod without affecting the rest of your mod list.

### INI Workarounds

If skins you install appear **very** blurry in game, it's possible there's a problem with the skin's mipmapping and how AC7 loads skin textures. There are a couple of keys you can add to your game's configuration file using the tweaks in the Workarounds tab of the Settings page.
