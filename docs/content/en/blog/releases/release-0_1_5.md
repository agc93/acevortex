---
title: "Alpha 1.5 Release"
linkTitle: "Release 0.1.5"
date: 2020-09-08
aliases:
  - /updates/v0.1.5
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a minor upgrade on the [previous alpha](/updates/v0.1.4) with some minor fixes:

- Vortex will now fix/rename older mod files more reliably
  - While [0.1.4]((/updates/v0.1.4)) would rename most files, it would not rename mods only containing one pak file. This has now been fixed!
  - Thanks to @Azekthi for reporting this [on GitHub](https://github.com/agc93/acevortex)
- Skin detection now happens when any mod is installed rather than as part of the advanced installer
  - Among other things, this means mods with FOMODs will still have skins detected automatically.
- Some more minor bugfixes and refactoring in preparation for some planned features

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page and see if that resolves any issues you're facing during installation