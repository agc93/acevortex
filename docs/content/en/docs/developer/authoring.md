---
title: "Packaging for Mod Authors"
linkTitle: "Packing Mods"
weight: 91
description: >
  Extra information for mod authors on maximizing compatibility with AceVortex
---

First off, I want to cover off one unfortunate reality of modding AC7 with Vortex: the way Vortex expects mods to work and the way AC7 handles mods don't match up quite right.

In particular, Vortex (usually) expects each mod archive to have only one `.pak` mod file and for different variants of a mod to be distributed as separate files on Nexus Mods. This isn't always practical though with mods often having multiple skins for multiple aircraft and then potentially multiplying that over multiple skin slots can make that untenable.

AceVortex tries to find a middle ground as much as possible.

---

If you're a skin mod author and want to improve the experience for users, also check out [ACMI](https://acmi.modding.app/). It's a simple tool that can automatically generate Mod Installer files (aka FOMOD files) for your skin mods. Just include the `fomod` directory that ACMI generates in your mod archive when you upload it and Vortex will automatically use them to show users a nice guided wizard/installer to choose what files to install.

---

In an ideal world, each mod archive would only have one `.pak` file in it. This doesn't just make installation easier, this also gives us the potential for some extra features in future, like controlling load order or improving metadata.

When a user installs a mod that has multiple `.pak` files, it runs a few checks and will start a guided process to install only the files it needs. The over-simplified version of the  installation is this:

1. If a mod only contains one `.pak` file, just install that by default
1. If there are multiple paths in the mod that contain one or more `.pak` files, it will ask the user whether to install only some or all
1. If any of the chosen paths contain more than one `.pak` file, it will also ask which specific `.pak` files to install, defaulting to all.

This should minimise the amount of friction for installing mods while also reducing the odds of a user installing conflicting skins/slots/etc.

> We also added a toggle in the Settings page to turn this behaviour off and just use the default behaviour, which is to install all the files found in the first path to contain a `.pak` file.