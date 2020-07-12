---
title: "Alpha 1.2 Release"
linkTitle: "Release 0.1.2"
date: 2020-07-11
aliases:
  - /updates/v0.1.2
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a smaller fix and upgrade on the [previous alpha](/updates/v0.1.1) with some small, but important, changes:

- More bugs fixed in the advanced installer
  - This includes a bug when installing multiple "root-level" paks from an archive and inconsistent results for different archive layouts
- We now *correctly* track what files you choose when installing archives with multiple mods
  - Last release we saved this information in mod notes, which was pretty hacky
  - Now, the installer uses a new attribute and you can always check what files you installed using the details panel (double click on the mod in your Mods list)
  - Unfortunately, this won't be applied retroactively so will only appear for newly installed or reinstalled mods

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

This is all-new functionality so please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page.