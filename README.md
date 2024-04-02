# openasar-installer

Automatically downloads and executes `openasar_installer_canary.bat`.

A remnant of me using [Powercord](https://github.com/powercord-org/powercord), I run Discord Canary. In place of Powercord, I use the wonderful [OpenAsar](https://github.com/GooseMod/OpenAsar).

All I need is a few lines of CSS to fix the window grab behavior of Discord's desktop app, and OpenAsar suits my uses. However, running Discord Canary means that updates will frequently replace the app.asar file with Discord's own bloated one, removing my CSS... and my beloved title bar fix.

As all developers do, I wrote this script over the course of 3 hours to save myself 15 seconds in the future.

Yes, using `puppeteer` is probably overkill. No, I don't care.


## Usage

This project depends on [node.js](https://nodejs.org/en).


Clone the repo:
```shell
git clone https://github.com/lanye74/openasar-installer.git
```

Install dependencies:
```shell
cd openasar-installer
npm i

# If you don't have it already
npm i -g typescript
```

Compile and run the script:
```shell
tsc

node main.js
```


Optionally, create a Powershell/batch/bash/etc. script and put it in your environment so that you can easily run the script from anywhere:
```shell
node "PATH/TO/FOLDER/openasar-installer/main.js"
```
