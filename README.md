# hncollapse

Collapsible comments for Hacker News

<img src="http://i.imgur.com/GQtFmv2l.png" title="hncollapse screenshot" />


## Install on Chrome

Google Chrome has built-in support for user scripts:

1. Open the Chrome Extensions page: chrome://extensions
2. Drag the hncollapse.user.js file onto the Extensions page
3. Grant access


## Install on Firefox using Greasemonkey:

1. Install the Greasemonkey add-on
2. Open a new blank tab
3. Drag the hncollapse.user.js file onto the tab
4. Grant access


## Install on other browsers

I think IE and Safari also have Greasemonkey plugins but I haven't tested those.  Code is compatible with IE10+ and if you try with IE9 but have errors, submit a bug report and I'll fix it for IE9 as well.


## Repo description:

```
  hncollapse.user.js - script source file.
  
  hn-sample.html - An example of a HN comments page which has `hncollapse.user.js` already loaded (via script tag in body)
  
  webserver.py - Simple webserver that can be used to test the script locally.
```


## Test locally:

```
$ git clone https://github.com/alanning/hncollapse.git
$ cd hncollapse
$ python webserver.py
$ open http://localhost:8000/hn-sample.html
```


## Debugging:

Turn on debug output by setting the `DEBUG` variable to true in the script.


## Documentation

All functions used in this repo are documented.
Run `yuidoc --server` in the repo directory or just check out the `docs` directory.

To install [yuidoc](http://yui.github.io/yuidoc/):

1. Download and install Node.js
2. Run `npm -g install yuidocjs`
