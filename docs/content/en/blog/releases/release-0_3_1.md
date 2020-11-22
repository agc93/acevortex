---
title: "Alpha 3.1 Release"
linkTitle: "Release 0.3.1"
date: 2020-11-21
aliases:
  - /updates/v0.3.1
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a small update on the [previous alpha](/updates/v0.3.0) with some pretty big new additions:

- Changed to using Steam to launch the game
  - You shouldn't see any obvious change here, but Vortex will now tell Steam to launch AC7 rather than launching it directly.
  - This should make things like controller configurations and the Steam overlay work more consistently.
- Automatic Save file backups <sup><em>PREVIEW</em></sup>
  - You can enable it in Settings > Workarounds
  - This will automatically create backups of your save file when mods are deployed and when launching the game through Vortex
  - This is still a preview feature, so report any issues you find if you want to try it out.

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex).