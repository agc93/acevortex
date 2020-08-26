---
title: "Alpha 1.4 Release"
linkTitle: "Release 0.1.4"
date: 2020-08-26
aliases:
  - /updates/v0.1.4
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a minor upgrade on the [previous alpha](/updates/v0.1.3) with some small, but important, changes:

- Vortex will now fix/rename older mod files
  - AC7 requires any mod files that touch post-launch content (skin slots, DLC planes, planes with extra slots) to have a name ending in `_P`
  - By default, we now rename any files that don't have this suffix on installation. This can be turned off in Settings.
  - Thanks to @Azekthi for suggesting this [on GitHub](https://github.com/agc93/acevortex)
- README files in mods will now be installed _properly_. There was a bug that could result in duplicate READMEs or none at all.
- Some more minor bugfixes and refactoring in preparation for some planned features

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page and see if that resolves any issues you're facing during installation.