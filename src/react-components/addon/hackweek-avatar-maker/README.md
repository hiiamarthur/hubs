# Hackweek Avatar Maker

This repository is to track work for the 2021 Hubs Team Q1 Hackathon. For discussion and ideation, please use the Issues tab, but note that this project is only lightly maintained by Mozilla. You can use the editor as-is [here](https://mozilla.github.io/hackweek-avatar-maker/).

## Creating an Avatar

To create an avatar for Hubs:

1. Go to [https://mozilla.github.io/hackweek-avatar-maker/](https://mozilla.github.io/hackweek-avatar-maker/). The first avatar that you see will be a randomly generated avatar using different components that are available.
2. Have fun! You can mix and match different selections to give your avatar a unique look.
3. Download your avatar using the 'Export avatar' button.
4. Sign into a Hubs room
5. Select the "More" icon in the bottom right corner of the screen and click "Change Name and Avatar".
6. Click the "Change Avatar" button.
7. From here, you can see a list of your own avatars, the first spot should say "Create Avatar".
8. Click the link that says 'Custom GLB', found under the three default body shapes
9. Upload the .glb file that you saved to your computer
10. Save your avatar and enjoy your new look!

## Creating Accessories and Custom Components

You can create custom components for the avatar by modeling the object in blender. While you can upload any .glb file as an accessory, using the base template for an avatar built with this editor will ensure that the uploaded custom component sits in the correct place on the avatar. More information can be found in the [customization guide](./CUSTOMIZING.md).

## License

The 3D models used in this app are ©2020-2022 by individual [mozilla.org](https://www.mozilla.org/) contributors, under a [Creative Commons Attribution-ShareAlike 3.0 license](https://www.mozilla.org/en-US/foundation/licensing/website-content/).

## About the editor

We invite the community to use this editor as a template for creating and hosting new avatar tools. The code is released under the [MPL 2.0 license](./LICENSE) and we'd love to see what you make with it! Here's a bit about how the editor works:

- The avatar that you see is comprised of different pieces that were designed to work on the same skeleton and body format. [Models](https://github.com/mozilla/hackweek-avatar-maker/tree/main/assets/models) for each piece and category are saved with a specific naming convention, which allows the app to correctly put them into a category depending on where the accessory should be placed on the base model.

- A script takes screenshots of the pieces that are contained in the `assets/models` directory and uses these to indicate the different pieces that can be selected from.

- When you've finished customizing your avatar, the meshes are combined and the correct components to have animations in Hubs are added to the avatar .glb file that is saved.

More information can be found in the [customization guide](./CUSTOMIZING.md).

## FAQ

**Q: I'm an avatar creator - can I make my own avatar editor for Hubs with this?**

A: Yes! We'd love that. Feel free to drop into the #avatars channel in our [Discord chat server](https://discord.gg/dFJncWwHun) if you have any questions about that.

**Q: Why isn't this built-in to Hubs?**

A: We're really keen on keeping a wide range of styles and avatars available for Hubs. We decided to make this a standalone application so that we could encourage others to build avatar tools that will work with Hubs, rather than being prescriptive about what we think avatars should look like.

**Q: Can you add a new hat / accessory / t-shirt / hair style?**

A: Since this was a hack week project, we're not actively building this out as a fully featured editor - so probably not.

**Q: Can _*I*_ add a new hat / accessory / t-shirt / hair style?**

A: Sure! If you build something custom and are interested in contributing it back under a Creative Commons license, feel free to submit a pull request that adds a new accessory with the proper naming convention. If you have questions about this, you can reach us on Discord or email us at hubs@mozilla.com

## Resources

- [Avatar Texture Tool (misslivirose)](https://github.com/misslivirose/avatar-texture-tool)
- [Avatar Customizer (rhiannanberry)](https://github.com/rhiannanberry/Avatar-Customizer)
- [Quilt (brianpeiris)](https://github.com/brianpeiris/quilt)
- [Hubs avatar pipelines](https://github.com/mozillareality/hubs-avatar-pipelines/)
- [Advanced Avatar Customization](https://hubs.mozilla.com/docs/creators-advanced-avatar-customization.html)
- [Video: using Hubs components for avatar creation in Blender](https://www.youtube.com/watch?v=qBvZhh6KVcg)
