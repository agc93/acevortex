---
title: "Alpha 2.1 Release"
linkTitle: "Release 0.2.1"
date: 2020-09-21
aliases:
  - /updates/v0.2.1
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a minor update on the [previous big alpha](/updates/v0.2.0) with some smaller fixes. If you haven't read the notes for the last release, please check them out! This fix release adds the following tweaks:

- NPC Skins handled much better
  - NPC skins will now be sorted to the bottom of the skin list for each aircraft so you can focus on your playable skins
  - You can also hide NPC skins from the skin view using the "Include NPC slots" checkbox at the top of the page
  - Hiding NPC slots won't remove them or skip conflict detection, it will just hide the entries in the skin list
- Some more improvements to skin detection
  - Added a minor fix for an edge case we hadn't accounted for (thanks Sly!)

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page and see if that resolves any issues you're facing during installation