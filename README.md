≤Online Notiwall
===============

This is a Chrome extension from the student organization Online at NTNU in Trondheim, Norway.

Like its sister extension, this extension fetches data from sources like SiT, AtB and student organizations in order to provide you, as a student, with practical information in your daily life. It is made by the Application Committee (appKom) in Online.

* appkom@online.ntnu.no

Installation of Notiwall
------------------------

Use a spare computer, one you don't need for anything else.

1. Install the latest version of [Ubuntu](http://www.ubuntu.com/desktop)
  * Write down the username and password from the installation!
  * Turn on Autologin when asked about it
1. Open "System Settings"
  * Displays -> Set rotation to clockwise
  * Brightness & Lock -> Never turn screen off
  * Appearance -> Behavior -> Auto-hide the launcher
1. Open "Update Manager"
  * Settings -> Never automatically check updates (we will get back to security updates)
  * Settings -> Never notify me of a new Ubuntu version
1. Open a terminal
  * `sudo apt-get install openssh-server vim unclutter chromium-browser unattended-upgrades update-notifier-common`
1. Enable automatic security updates
  * Go here to find an updated guide: https://help.ubuntu.com/community/AutomaticSecurityUpdates
  * Follow the guide currently titled "Using the unattended-upgrades package"
  * The very short version:
    * `sudo dpkg-reconfigure -plow unattended-upgrades`
    * `sudo vim /etc/apt/apt.conf.d/50unattended-upgrades`
      * Uncomment the line `//Unattended-Upgrade::Automatic-Reboot "false";`
      * And of course change the line to "true"
1. Open Chrome
  * Settings -> Set Chrome as default browser
  * Settings -> Do not offer to save passwords
  * Settings -> On startup, open the new tab page (this is important for kiosk mode to work properly)
  * Install Notiwall from the [Chrome Web Store](<LINK>)
  * Online Notiwall Options -> Choose your settings and choose a Notiwall, e.g. the infoscreen or the officescreen
1. The launcher
  * Lock the following icons to the launcher, for easy access:
    * Chromium, System Settings, Startup Applications, Update Manager, Terminal
  * Remove unnecessary icons in the launcher
    * Yes, Firefox as well
1. Open “Startup Applications”
  * Add `chromium-browser --kiosk --disable-translate`
  * Add `unclutter`
1. `sudo reboot`
1. Enter the BIOS on startup (typically by clicking F2, F9, F10 or Del like a maniac)
  * Find the option for what happens on power-loss, set it to turn power back on
  * This feature is very important for the infoscreen to survive power outages, which are frequent at NTNU due to construction work
1. Reboot normally. It should open a Notiwall and keep itself updated on its own. If not, please email us at appkom@online.ntnu.no

Congratulations! Your Notiwall will now turn on automatically, event after power loss, then open Notiwall in fullscreen, keep itself updated, and look good! No pesky infobars asking whether you want to translate from Norwegian, or any other silly stuff.

Development setup
-----------------

The development environment for Online Notiwall is quite simple.

1. Install Node JS
1. Install LESS globally: `sudo npm install -g less`
1. Install LESS watcher: `sudo npm install -g less-watcher`
1. Run watcher for continuous compilation of LESS to CSS: `less-watcher -p "" -d less`

Technology stack
----------------

Some of the data is delivered by [Notipis](https://github.com/appKom/notipi) (raspberry pis), via the middle layer [Online Notiwire](https://github.com/appKom/notiwire). Notipi is a joint project between Omega Verksted and Onlines appKom. Notipis consist of hardware from Omega Verksted and software from Online appKom.

The hardware bundle which complements makes hardware features in Notifier accessible to any student union who purchases and installs the bundle. OmegaV currently sells this bundle at a reasonable price. The earnings goes to further development and to support OmegaV's operations.

* omegav@omegav.no (hardware)
* appkom@online.ntnu.no (software)

Features overview
-----------------

For all the included affiliations

- Displays news from the selected "linjeforening"
- Displays todays dinner menu and opening hours from SiT cantinas, cafés and kiosks
- Displays bus data from AtB in realtime
- All pages in the extension are live, they stay updated while open
- Best used with a full HD vertical screen (or better) for continous use

Additional features for affiliations who have a [NotiPi](https://github.com/appKom/notipi)

- Displays office status: Open, closed, meeting, waffles
- Displays todays meetings and current servant at the office
- Displays the status of the coffee pot at the office

In-depth features
-----------------

General

- Only HTML5, CSS3 and JavaScript
- Libraries used: jQuery, LESS
- Opens options page on first run
- All pages keep themselves updated while running
- Separate scripts containing constants and defaults, for changeability
- Runs Google Analytics on all pages, tracking both pages and events anonymously
- Detects network status, halts all operations and resource usage when offline
- Dev mode: Faster updates, frequent clearing of localstorage
- Automatic production detection prevents accidentally using developer mode in production

Student organizations

- Affiliations
  - Tons of different organizations and institutions are supported
  - Each organization has it's own logos and symbols
  - Each organizations' news feed is fetched and parsed
  - Each organization has a recommended color palette
  - Support for organization specific color palettes
  - A highly customizable image fetcher that extracts images from each affiliation websites since the RSS-feeds usually doesn't contain image links
- News
  - Fetches and parses feeds from affiliations' websites, both for primary and secondary affiliation
  - Support for a separate news fetching function specific to an organization, even ones without RSS/Atom feeds
  - Counts unread news and presents unread number in icon badge
  - Separates between new, updated and read items (deprecated)
- Palettes
  - Stored as plain, short CSS stylesheets
  - Override common CSS selectors in options, popup and the infoscreen
  - Primarily changing style of the background image via CSS3 hue-rotation and such
  - Palettes may also change colors of titles, pageflip and other details

SiT

- Cantinas
  - Fetches and parses feed from SiTs website through http://sit.no/rss
  - User may select any two cantinas at any campus to be shown in the popup
  - Strips down dinner menu down to the bare necessities
  - Presents dinners with pricing in ascending order
  - Able to handle all known cases of strange formatting for SiT
- Hours
  - Also fetches opening hours for all cantinas through http://sit.no/ajax

AtB

- Realtime
  - Displays the user's two favorite stops
  - Fetches realtime bus data from a third-party API at bybussen.api.tmn.io
  - Frequently updated in order to always show correct information
  - Support for favorite bus lines, simplifying finding a particular bus at a busy stop
  - Smart selection of bus stops at the options page, quickly determining which stop the user wants
  - The complete list of bus stops is fetched and parsed every now and then

Hardware Features (requires [NotiPi](https://github.com/appKom/notipi))

- Office
  - Office open/closed/meeting status is fetched from [Online Notiwire](https://github.com/appKom/notiwire) where it is based on light intensity data from [Notipis](https://github.com/appKom/notipi) and each affiliations Google Calendar
  - Icon changes based on light values and calendar events
  - Uses title text containing the name of the event, or other appropriate text
  - Separate icon showing when you are offline or when an error has occured
  - All states: Default, open, closed, meeting, waffles, error (error usually means disconnected)
- Meetings
  - Meeting list is fetched via [Online Notiwire](https://github.com/appKom/notiwire)
  - Showing the rest of the days meetings so users may easily spot when to grab a coffee
- Servant
  - Shows who is responsible for the affiliation office at any given time
  - Servant list fetched [Online Notiwire](https://github.com/appKom/notiwire)
- Coffee
  - Coffee pot status fetched via [Online Notiwire](https://github.com/appKom/notiwire)
  - Push the button on the [Notipi](https://github.com/appKom/notipi) in your organizations office to notify users when someone is cooking a new pot of coffee
  - Overview shows how fresh the last pot of coffee is and how many pots of coffee has been made today

Options

- Easily accessible options page via the extension icon (as a popover)
- Allows you to tweak most interesting features

Analytics

- All statistics are anonymously collected and helps develop the project further
- Runs page tracking on all pages which gives general traffic, OS, browsers, countries etc.
- Runs event tracking on key events throughout all main javascript files
- Event tracking is split into categories which have the same name as the page name it originates from, this is done because there are so few pages in the project
- Categories are split into actions which are either clickSomething, loadSomething or toggleSomething
- An action may have a label, which is usually the clicked link, the loaded file, and so on

Chronological Credz
-------------------

Key people are annotated with their email address

- Michael Johansen <michael@informatikk.org> is the project leader and was the sole developer of the extension itself (not support services) for the first couple of years
- Christian Duvholt wrote Online Notiwire
- Tri Minh Nguyen created the API for AtB's realtime bus API
- Magnus Dysthe has been working on hardware for the infoscreen
- Tor Håkon Bonsaksen helped with several hardware issues
- Kristoffer Dalby hacked up scripts that fixed ubuntu screen-to-black issues
- Nils Herde fixed hardware issues, kept the infoscreen running and installed the coffee button
- Eirik Larsen <eirik.larsen93@gmail.com> made the OmegaV NotiPi, which made Notiwall's hardware features accessible to all the student unions in Trondheim

Media coverage
--------------

- None yet, see the Notifier repository.

Issues submitted to Chromium
----------------------------

- None yet, see the Notifier repository.
