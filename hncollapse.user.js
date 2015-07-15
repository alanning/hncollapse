// Copyright (c) 2015, Adrian Lanning
// Released under the GPLv3 license
// http://www.gnu.org/licenses/gpl.html

// ==UserScript==
// @name           hncollapse
// @namespace      https://github.com/alanning
// @description    Collapsible comments for Hacker News
// @include        https://news.ycombinator.com/item*
// @license        GPLv3
// @grant          none
// @version        0.1
// ==/UserScript==

;(function () {

"use strict"

/**
 * @module hncollapse
 * @class hncollapse
 */

var DEBUG = false,
    forEach = function (a, b) { a && Array.prototype.forEach.call(a, b); },
    filter = function (a, b) {return Array.prototype.filter.call(a, b)},
    map = function (a, b) {return Array.prototype.map.call(a, b)},
    HNTRIGGER = 'hncollapse-trigger',
    HNCOLLAPSED = 'hncollapsed',
    COLLAPSED_COMMENT = "tr.athing.hncollapsed",
    TRIGGER_ID = "data-hncollapsed-trigger-id",
    PARENT_TRIGGER_ID = "data-hncollapsed-trigger",
    Util,
    CSS


/**
 * Main startup function
 *
 * @method startup
 */ 
function startup () {
  var commentHeaders

  DEBUG && console.log('[hncollapse] startup')

  loadCSS()
  
  commentHeaders = getCommentHeaders()
  DEBUG && console.log("Found", commentHeaders.length, "comment headers")
  
  addCollapseLinks (commentHeaders)
  document.body.addEventListener('click', clickHandler)
}



/**
 * Load required CSS styles
 *
 * @method loadCSS
 */
function loadCSS () {
  var css = ".hncollapse-trigger {cursor:pointer;}" +
            ".hncollapsed {display:none;}"

  try {
    CSS.addGlobalStyle(css)
  } catch (ex) {
    console && console.error &&
      console.error("[hncollapse] error loading css", ex)
  }
}

/**
 * Find all `comhead` comment header elements on the page.
 * Ignores the one in the page title since it's not a real comment.
 *
 * @method getCommentHeaders
 */
function getCommentHeaders () {
  var commentHeaders = document.getElementsByClassName('comhead')

  // ignore the one in the page title
  commentHeaders = Array.prototype.slice.call(commentHeaders, 1)

  return commentHeaders
}

/**
 * Add a collapse `trigger` element to each comment header.
 * i.e. `[-]`
 *
 * @method addCollapseLinks
 * @param {Array} commentHeaders List of comment header elements
 */
function addCollapseLinks (commentHeaders) {
  if (!commentHeaders) {
    return
  }

  forEach(commentHeaders, function (head) {
      var txt = document.createElement("span"),
          inner

    inner = getTriggerText()

    if (DEBUG) {
      inner += " " + Util.getTop(head)
    }

    txt.innerHTML = inner
    txt.className = HNTRIGGER

    head.appendChild(txt)
  })
}

/**
 * The text to use for the collapse trigger.
 *
 * @method getTriggerText
 * @param {Boolean} [collapsed] Is the comment in a collapsed state?
 *                              Default: false
 */
function getTriggerText (collapsed) {
  if (collapsed) {
    return "[+]"
  } else {
    return "[-]"
  }
}

/**
 * Is the passed in element one of our trigger elements?
 *
 * @method isTriggerElement
 * @param {Element} element HTML Element to test
 * @return {Boolean} true if element is a trigger element
 */
function isTriggerElement (element) {
  var classes,
      i, len

  if (!element || element.nodeName !== "SPAN") {
    return false
  }

  classes = element.className.split(' ')
  for (i = 0, len = classes.length; i < len; i++) {
    if (HNTRIGGER === classes[i]) {
      return true
    }
  }

  return false
}

/**
 * Collapse or restore the clicked comment's text.
 *
 * @method toggleClickedComment
 * @param {Element} commentWrapper Outer-level TR Element that wraps the
 *                                 clicked comment
 * @param {Element} triggerElement The clicked element / collapse trigger
 * @return {Boolean} true if the child comments should be collapsed, false
 *                   if they should be displayed
 */
function toggleClickedComment (commentWrapper, triggerElement) {
  var commentText,
      ownReply,
      collapsed

  commentText = commentWrapper.querySelectorAll('span.comment')[0]
  ownReply = commentWrapper.querySelectorAll('div.reply')[0]

  CSS.toggleClass(commentText, HNCOLLAPSED)
  CSS.toggleClass(ownReply, HNCOLLAPSED)

  collapsed = CSS.hasClass(commentText, HNCOLLAPSED)
  triggerElement.innerHTML = getTriggerText (collapsed)

  return collapsed
}

/**
 * Collapse the child comments of the target comment.
 *
 * Adds a unique id to the trigger element and to each collapsed comment
 * so we can track which comments belong to which triggers.
 *
 * @method collapseChildComments
 * @param {Element} targetComment Comment which user requested to collapse
 * @param {Element} triggerElement Trigger element which user clicked
 */
function collapseChildComments (targetComment, triggerElement) {
  var comments,
      triggerId

  comments = findChildComments(targetComment)

  if (comments && comments.length > 0) {
    triggerId = +(new Date())
    triggerElement.setAttribute(TRIGGER_ID, triggerId)

    forEach(comments, function (comment) {
      comment.setAttribute(PARENT_TRIGGER_ID, triggerId)
      comment.classList.add(HNCOLLAPSED)
    })
  }
}

/**
 * Restore the child comments associated with the trigger element.
 *
 * Removes the unique id from the trigger element and any child comments.
 *
 * @method restoreChildComments
 * @param {Element} triggerElement Trigger element which user clicked
 */
function restoreChildComments (triggerElement) {
  var triggerId,
      comments

  // get the unique id from the trigger element
  triggerId = triggerElement.getAttribute(TRIGGER_ID)
  triggerElement.removeAttribute(TRIGGER_ID)

  // find collapsed comments with matching id
  comments = document.querySelectorAll(COLLAPSED_COMMENT)
  forEach(comments, function (comment) {
    var id = comment.getAttribute(PARENT_TRIGGER_ID)

    if (id == triggerId) {
      CSS.removeClass(comment, HNCOLLAPSED)
      comment.removeAttribute(PARENT_TRIGGER_ID)
    }
  })
}

/**
 * Delegate click handler which starts collapse or restore process when
 * a trigger element is clicked.
 *
 * @method clickHandler
 * @param {Event} evt
 */
function clickHandler (evt) {
  var triggerElement,
      targetComment,
      hideChildComments

  if (isTriggerElement(evt.target)) {
    triggerElement = evt.target
    // hide own comments
    targetComment = Util.findParent(triggerElement, "tr.athing")
    hideChildComments = toggleClickedComment(targetComment, triggerElement)

    // now handle any child comments
    if (hideChildComments) {
      collapseChildComments (targetComment, triggerElement)
    } else {
      restoreChildComments (triggerElement)
    }
  }
}


/**
 * Get all child comments based on the passed in element.
 *
 * As of July 08, 2015, comments on HN are displayed in individual TR
 * elements rather than nested within each other.  The "nesting" is
 * solely controlled by a spacer element on the left of the TR which
 * indents the content of the comment.
 *
 * This function:
 *
 * 1. finds all spacer elements
 * 2. filters out any that are above the target comment
 * 3. loops through in order and only keeps those that are of greater
 *    indentation level than the target comment
 * 4. returns the parent top-level TR's for the remaining spacers
 *
 * The following structure is assumed:
 *   'tr.athing' = Top-level HN comment wrapper
 *   'td.ind'    = indentation / spacer element located inside wrapper
 *
 * @method findChildComments
 * @param {Element} element An HTML Element that either _is_ the target
 *                          comment's TR wrapper or is an element within it.
 * @return {Array} list of comments (TR's) which are "children" of the target
 *                 comment
 */
function findChildComments (element) {
  var targetComment,
      targetIndent,
      targetWidth,
      targetY = 2,  // empty spacer TD is 2 pixels wide
      allIndents,
      allIndentsAfterTarget,
      indent,
      childIndents = [],
      childComments

  if (element.tagName.toLowerCase() === 'tr' && CSS.hasClass(element, 'athing')) {
    // element _is_ the target comment wrapper
    targetComment = element
  } else {
    // assume element is within target comment wrapper
    targetComment = Util.findParent(element, 'tr.athing')
  }

  if (!targetComment) {
    return []
  }

  targetIndent = targetComment.querySelectorAll('td.ind')[0]
  if (!targetIndent) {
    return []
  }

  targetY = Util.getTop(targetIndent)
  targetWidth = CSS.outerWidth(targetIndent)

  DEBUG && console.log('target indent =', targetWidth, ' top =', targetY)

  allIndents = document.getElementsByClassName("ind")
  //DEBUG && Util.highlight(allIndents, '#888')
  //DEBUG && console.log("allIndents = ", allIndents.length)

  allIndentsAfterTarget = filter(allIndents, function (elem) {
    var t = Util.getTop(elem)

    //DEBUG && console.log(targetY, t, t > targetY)
    return t > targetY
  })
  DEBUG && console.log("allIndentsAfterTarget = ", allIndentsAfterTarget.length)

  DEBUG && Util.highlight(allIndentsAfterTarget, '#888')

  for (var i = 0, len = allIndentsAfterTarget.length; i < len; i++) {
    indent = allIndentsAfterTarget[i]
    if (CSS.outerWidth(indent) > targetWidth) {
      childIndents.push(indent)
    } else {
      break;
    }
  }

  DEBUG && Util.highlight(childIndents)

  childComments = Util.findParent(childIndents, "tr.athing")

  //DEBUG && Util.highlight(childComments)

  return childComments
}




/**
 * General helper functions
 *
 * @class Util
 */
Util = {

  /**
   * Get the absolute Y position of the target element
   *
   * @method getTop
   * @param {Element} element
   * @return {Number} Absolute Y position of the top of the element
   */
  getTop: function (element) {
    return element.getBoundingClientRect().top + window.scrollY
  },

  /**
   * Highlight the target element.
   *
   * @method highlight
   * @param {Element} element
   * @param {String} [color] Default: 'blue'
   */
  highlight: function (element, color) {
    color = color || 'blue'

    if (element) {
      if (element.length) {
        forEach(element, function (e) {
          e.style = "background-color:" + color + ";"
        })
      } else {
        element.style = "background-color:" + color + ";"
      }
    }
  },

  /**
   * Return the parent element based on tagName.
   * If a list is passed, return a list of parent elements treating
   * each source element as if it had been passed individually.
   *
   * @method findParent
   * @param {Element | NodeList} element The child element or list of
   *                                     child elements
   * @param {String} tagName HTML tag name of the parent element to find.
   *                         May can also include a className to further
   *                         refine search. ex. "tr", "tr.comment"
   * @return {Element | Array} parent element or list of parent elements.
   *                           If none found, returns undefined or list
   *                           of undefined
   */
  findParent: function (element, tagName) {
    var found = false,
        split,
        className

    if (element.length) {
      // loop through each element in NodeList
      return map(element, function (e) {
        return Util.findParent(e, tagName)
      })
    } else {
      if (-1 !== tagName.indexOf('.')) {
        split = tagName.split('.')
        tagName = split[0]
        className = split[1]
      }
      tagName = tagName.toLowerCase()

      while (element && !found) {
        element = element.parentNode

        if (element && element.tagName.toLowerCase() === tagName) {
          if (className) {
            if (element.classList.contains(className)) {
              found = true
            }
          } else {
            found = true
          }
        }
      }

      if (!found) {
        return  // undefined
      }

      return element
    }
  }
}  // end Util




/**
 * CSS Helpers
 *
 * mostly from: http://youmightnotneedjquery.com/
 * @class CSS
 */
CSS = {

  /**
   * Check if an element has the specified CSS class.
   *
   * @method hasClass
   * @param {Element} el
   * @param {String} className
   * @return {Boolean} true if element has specific class
   */
  hasClass: function (el, className) {
    if (el.classList) {
      return el.classList.contains(className)
    } else {
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className)
    }  
  },

  /**
   * Add the specified class to the target element.
   *
   * @method addClass
   * @param {Element} el
   * @param {String} className
   */
  addClass: function (el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  },

  /**
   * Remove the specified class from the target element.
   *
   * @method removeClass
   * @param {Element} el
   * @param {String} className
   */
  removeClass: function (el, className) {
    if (el.classList) {
      el.classList.remove(className)
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ')
    }  
  },

  /**
   * Toggle the specified CSS class.  If the element already has it, it is
   * removed.  If not, it is added.
   *
   * @method toggleClass
   * @param {Element} element
   * @param {String} className
   */
  toggleClass: function (element, className) {
    if (!element) {
      return
    }

    if (CSS.hasClass(element, className)) {
      CSS.removeClass(element, className)
    } else {
      CSS.addClass(element, className)
    }
  },

  /**
   * Get the "outerWidth" of an HTML element.
   *
   * @meteor outerWidth
   * @param {Element} el
   * @return {Number} offsetWidth + margins
   */
  outerWidth: function (el) {
    var width = el.offsetWidth,
        style = getComputedStyle(el);

    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
  },

  /**
   * Add css to the page's HEAD.
   *
   * @method addGlobalStyle
   * @param {String} css
   */
  addGlobalStyle: function (css) {
    var head,
        style;

    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
  }
}  // end CSS




startup()

})();
