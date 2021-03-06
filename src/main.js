import { pubsub } from './pubsub';
import collection from './collection';
import Onscroll from './onscroll';

/**
 * Scroll callback function
 * @type {function}
 */
const scroll = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  function (callback) { window.setTimeout(callback, 1000/60) };
/**
 * Current H & V scrolls position
 * @type {{left: number, top: number}}
 */
window._onscroll = {
  direction: {
    north: false,
    south: false,
    west: false,
    east: false
  },
  position: {
    left:0,
    top: 0
  }
};
/**
 * Scroll mode
 * @type {string}
 */
let mode = 'scroll'; // 'requestAnimationFrame'
/**
 * Indicates whether library is up and running (has at least 1 instance)
 * @type {boolean}
 */
let active = false;

/**
 * Main execution function
 * @type {function}
 */
function run() {
  if (active) {
    // position hasn't changed (optimization):
    if (window._onscroll.position.left === window.pageXOffset && window._onscroll.position.top === window.pageYOffset) {
      // re-run:
      if (mode === 'requestAnimationFrame') {
        scroll(run);
      }
      return false;
    }

    window._onscroll = {
      direction: {
        north: window.pageYOffset < window._onscroll.position.top,
        south: window.pageYOffset > window._onscroll.position.top,
        west: window.pageXOffset < window._onscroll.position.left,
        east: window.pageXOffset > window._onscroll.position.left
      },
      position: {
        left: window.pageXOffset,
        top: window.pageYOffset
      }
    };
    collection.data.forEach(o => {
      o.run();
    });

    // re-run:
    if (mode === 'requestAnimationFrame') {
      scroll(run);
    }
  }
}

pubsub.subscribe('collection:changed', function () {
  // there is at least 1 instance:
  if (collection.size() > 0) {
    if (!active) {
      // add event listener:
      switch (mode) {
        case 'scroll':
          window.addEventListener('scroll', run);
          break;
        case 'requestAnimationFrame':
          scroll(run);
          break;
      }

      // trigger scroll event to apply directives for current positions:
      if (document.readyState !== 'complete') {
        window.addEventListener('load', function () {
          window.scrollTo(window.scrollX, window.scrollX);
        });
      }
      else {
        window.scrollTo(window.scrollX, window.scrollX);
      }

      console.log('Onscroll initialized');
      active = true;
    }
  }
  // no instances in collection:
  else {
    if (active) {
      window.removeEventListener('scroll', run);
      active = false;
    }
  }
});

// export default Onscroll:
module.exports = Onscroll;
