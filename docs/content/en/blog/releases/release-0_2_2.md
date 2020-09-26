---
title: "Alpha 2.2 Release"
linkTitle: "Release 0.2.2"
date: 2020-09-25
aliases:
  - /updates/v0.2.2
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a minor update on the [previous alpha](/updates/v0.2.1) with some more minor fixes and improvements. If you haven't read the notes for the last feature release, please [check them out](/updates/v0.2.0)! This fix release adds the following tweaks:

- Improvements to Skins view
  - There's a new "Find more" button for each aircraft allowing you to quickly search Nexus Mods for skins for a specific aircraft
  - We've also cleaned up the layout so long aircraft lists should wrap/scroll/align properly
- Some more improvements to skin detection
  - We should no longer incorrectly identify weapon skins as an aircraft
  - Manually refreshing skins (using the *Refresh Skins* action) will now remove "stale"/incorrect skins for a mod

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page and see if that resolves any issues you're facing during installation