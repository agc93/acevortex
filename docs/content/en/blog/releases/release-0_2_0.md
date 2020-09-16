---
title: "Alpha 2 Release"
linkTitle: "Release 0.2.0"
date: 2020-09-16
aliases:
  - /updates/v0.2.0
description: >
  Alpha release of AceVortex
---

{{% pageinfo %}}
This release is now available [on Nexus Mods](https://www.nexusmods.com/site/mods/125?tab=files).
{{% /pageinfo %}}

This release is a feature update on the [previous alpha](/updates/v0.1.5) with some pretty big new additions:

- AceVortex now reads skin slots from mod files much more reliably
  - I mean **a lot** more reliably so almost any mod available on Nexus Mods today should have its slots automatically detected after installation
  - If you had mods that weren't detected previously, use Refresh Skins from the context menu to try again with the new version
  - We also now show much better/more accurate names for aircraft (no more PKFA or RFLM)
- New Skins page for checking your installed skin mods!
  - This new page added to the left menu bar lets you view all your enabled skin mods sorted by aircraft and slot
  - You can quickly check what mods you have installed for each aircraft and each slot at a glance
  - Big thanks to SlyCooperFan and the rest of #ac-modding for helping with feedback and ideas on this one!

![new skins view example](https://staticdelivery.nexusmods.com/mods/2295/images/125/125-1600271835-269775160.png)

> All of the automatic skin slot features are a) very new and potentially not 100% stable and b) not guaranteed to work. Depending on how the mod was packed, we might not be able to auto-detect the slot and you will have to keep track of those mods yourself.

As always, please report any issues you find [on GitHub](https://github.com/agc93/acevortex). If things go really awry, you can also turn off the new installer in the Settings page and see if that resolves any issues you're facing during installation