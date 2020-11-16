---
title: "Alpha 3 Release"
linkTitle: "Release 0.3.0"
date: 2020-11-16
aliases:
  - /updates/v0.3.0
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a feature update on the [previous alpha](/updates/v0.2.3) with some pretty big new additions:

- AceVortex now reads skin slots from mod files much more reliably (again, for real this time)
  - Now mods that include multiple skins (especially NPCs) will show all their included skins, not just the first one
  - We also support some of the weirder, older packing formats so even older mods should detect better.
  - If you had mods that weren't detected previously, use Refresh Skins from the context menu to try again with the new version
- Attributes have been completely retooled
  - The "Skin(s)" attribute is now included in your main mod list!
    - Mods that include skins will feature a small aircraft icon you can click to quickly check what skins are included
  - Skins and installed files should now be shown more consistently
  - A _ton_ of behind-the-scenes changes to make this stuff look and work more consistently too
- A ton of other minor updates
  - Finding new aircraft skins from the Skins view is easier (and includes ModDB)
  - Bunch of minor layout changes/fixes
  - Heaps of behind-the-scenes code cleanup and refactoring that should make things a little more stable and easier to update

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex).