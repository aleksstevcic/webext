# DGG Injector

DGG Injector is a chrome and firefox extension which allows the user to swap out Twitch chat for Destiny.gg's embedded chat (destiny.gg/embed/chat). This is usually the chat that is preferred for streamer Destiny, so I thought I would add a fairly easy accessibility option for it.

Chrome has JQuery, as I built the chrome extension first and felt comfortable with JQuery, but ran into firefox's guidelines that block it, so firefox's is a better version of the app.

# Things I want to do but am very lazy to do

I want to be able to have them swap between different twitch chats, as well has have the configuration save on a per-channel basis. This seems to be tricky as Twitch seems to have security risks when loading an iframe from a different domain, and will refuse to load normal chat after the iframe is loaded. I'm guessing a good workaround is to embed both twitch chat and dgg chat in iframes, then those in another iframe, and see if that may bypass the networking issue, but I have no idea.

