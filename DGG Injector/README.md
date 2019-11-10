# DGG Injector

DGG Injector is a Chrome and Firefox extension which allows the user to swap out any Twitch chat for [Destiny.gg's](https://www.destiny.gg/bigscreen) embedded chat (destiny.gg/embed/chat). 

[Destiny](https://www.twitch.tv/destiny) the streamer defers to his own website's chat rather than Twitch's. Because of good moderation, high engagement by Destiny and those in his sphere, and Destiny.gg's overlay in the streams themselves, it is by far the preferred chat with which to engage. 

Chrome extension NO LONGER uses jQuery. Expecting (negligible) performance gains.

---

# Usage

* Can be used to replace Destiny's Twitch chat with the far more relevant Destiny.gg chat on Destiny's Twitch page, if one prefers Twitch's site
* Offers an easy solution when Destiny participates in Twitch streams that aren't on his main channel. Example: when he leaves to "play" in the [Rajj](https://www.twitch.tv/rajjpatel) Royale
* Many streamer's Twitch chats are an unmoderated mess. Watching anyone's Twitch with Destiny.gg's chat overlayed on top can be preferable

---

# Getting Started

This extension is built for use in both Chrome and Firefox. 

⭐️ [Here's a link to its Chrome extension](https://chrome.google.com/webstore/detail/dgg-injector/dinhjiedidnaoglplfcmilcakpdabdpm) 

⭐️ [Here's a link to its Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/dgg-injector/) 

1. Download the extension via the above link(s)
2. Go to any Twitch channel
3. Click the extension's icon in the top right

You should be good to go!

---

# TODO

Please message [Fythic](https://www.reddit.com/message/compose/?to=Fythic) or ask their GitHub account [aleksstevcic](https://github.com/aleksstevcic) if you would like to contribute! Or just go ahead, really 🌺

### TODO Current 
Items currently on the To Do list for this project:

* An option to swap between different Twitch chats
* DONE: Save-able configuration settings on a per-channel basis - DGG chat will now automatically turn on for channels that you have it left on for, without needing to click it every time you load the channel
* A webpage to be able to view, add, or remove items from your whitelist of channels
* Save extra information, such as the preferred width of the chat on a per-channel basis

### TODO Road Blocks
Loading an iframe from a different domain will refuse to load normal chat after the iframe is loaded. I'm guessing a good workaround is to embed both twitch chat and dgg chat in iframes, then those in another iframe, and see if that may bypass the networking issue, but I have no idea.

*The current extension destroys a bunch of twitch navigation features until you refresh the page. (Debugging seems to be that FrankerFaceZ extension breaks. I am not sure how to fix or anything.)

---

# Contributors 
:crown: [aleksstevcic](https://github.com/aleksstevcic) ~ Initial Idea, Development

[emmawhere](https://github.com/emmawhere) ~ Documentation

