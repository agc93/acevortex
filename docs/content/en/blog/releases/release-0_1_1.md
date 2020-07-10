---
title: "Alpha 1.1 Release"
linkTitle: "Release 0.1.1"
date: 2020-07-09
aliases:
  - /updates/v0.1.1
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is another big upgrade on the [previous alpha](/updates/v0.1.0) with a bunch of new features!

The biggest change in this release is that we've added proper integration for skin mods, including skin slot detection! When you install a skins mod (assuming you use the [new and improved installer](/updates/v0.1.0)), Vortex will read the `.pak` files you install and try and automatically detect what aircraft and slot the mod is intended for. You can check what skins a mod provides in the details panel (double-click on the mod in the Mods list).

Whenever you deploy your mods, AceVortex will also run a quick check to try and see if any of your mods are trying to replace the same slot and give you a warning so you can change what slots you are using. For any skin mods you had installed before this update, you can right-click the Mod and select "Refresh Skins" to auto-detect the skin slots.

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

Other changes in this release include:

- Installer will now include what paks you chose as mod notes
- Improved installer when installing "all" paks in a mod
- Added skin slot attribute with slot names
- A lot of behind-the-scenes refactoring for the new installer

This is all-new functionality so please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page.