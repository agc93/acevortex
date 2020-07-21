---
title: "Alpha 1.3 Release"
linkTitle: "Release 0.1.3"
date: 2020-07-20
aliases:
  - /updates/v0.1.3
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a minor upgrade on the [previous alpha](/updates/v0.1.2) with some small, but important, changes:

- README files in mods will now be installed
  - If a mod contains only one `.txt` file, AceVortex will assume it's a README file and install it to a seperate `README` folder in your `~mods` folder
  - You can turn this behaviour off in Settings
- INI tweaks added
  - We've added a section to the Workarounds tab of the Settings page for INI tweaks/workarounds
  - At this time, the only included tweak is a possible fix for blurry textures with certain skin mods
- Some more minor bugfixes and refactoring in the installer and settings

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

This is all-new functionality so please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page.