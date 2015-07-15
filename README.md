# hncollapse

Collapsible comments for Hacker News

<img src="http://i.imgur.com/GQtFmv2l.png" title="hncollapse screenshot" />

## Repo description:

```
  hncollapse.user.js - User Script that can be used in Firefox/Greasemonkey.
  
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


## Load using Greasemonkey:

I'm not too familiar with Greasemonkey so I had some trouble getting the script to actually run against the live HN comments page.  I'm not sure why, but to get it to work I had to make sure that `https://news.ycombinator.com/item` was set in the "Included Pages" section for both the "User Settings" and the "Script Settings" Greasemonkey tabs.  Hopefully it will load for you automatically if you install the script...


## Debugging:

Turn on debug output by setting the `DEBUG` variable to true in the script.


## Documentation

All functions used in this repo are documented.
Run `yuidoc --server` in the repo directory or just check out the `docs` directory.

To install [yuidoc](http://yui.github.io/yuidoc/):

1. Download and install Node.js
2. Run `npm -g install yuidocjs`
