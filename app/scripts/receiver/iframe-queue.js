module.exports = (function(window, undefined) {
  'use strict';

  var Viewport = require('./viewport');

  function Iframe(dashboard, options) {
    var vp = new Viewport(dashboard.viewport);
    this.dashboard = dashboard;
    this.ready = options.ready;
    this.el = document.createElement('iframe');
    document.body.appendChild(this.el);

    var load = function() {
      this.el.removeEventListener('load', load, false);
      if (dashboard.delay) {
        console.info('[Dashkiosk] iframe ready ' +
                     this.el.getAttribute('src') +
                     ', but wait ' +
                     dashboard.delay + 's');
        window.setTimeout(function() {
          this.show();
        }.bind(this), dashboard.delay * 1000);
      } else {
        this.show();
      }
    }.bind(this);
    this.el.addEventListener('load', load, false);

    this.el.setAttribute('scrolling', 'no');
    this.el.setAttribute('frameborder', '0');

    // Adapt iframe to match desired viewport
    vp.adapt(this.el);

    // Load the URL
    this.el.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    this.el.setAttribute('src', dashboard.url);
  }

  Iframe.prototype.displayed = function() {
    return this.el.classList.contains('show');
  };

  Iframe.prototype.remove = function() {
    if (this.el.classList.contains('show')) {
      this.el.classList .remove('show');
      window.setTimeout(function() {
        this.el.parentNode.removeChild(this.el);
      }.bind(this), 1001);                 // This is more reliable than relying on transitionend
    } else {
      this.el.parentNode.removeChild(this.el);
    }
  };

  Iframe.prototype.show = function() {
    console.info('[Dashkiosk] iframe ready ' + this.el.getAttribute('src'));
    if (this.ready) {
      this.ready();
    }
    this.el.classList.add('show');
  };

  function Queue(options) {
    this.queue = [];
    this.ready = options.ready;
  }

  Queue.prototype.flush = function() {
    var iframe;
    while ((iframe = this.queue.shift())) {
      iframe.remove();
    }
  };

  Queue.prototype.push = function(dashboard) {
    // Remove the first iframe if it is not loaded
    var iframe = this.queue.shift();
    if (iframe !== undefined) {
      if (iframe.displayed()) {
        // Oops, it is loaded, put it back.
        this.queue.unshift(iframe);
      } else {
        // Remove it, we will put ours instead
        iframe.remove();
      }
    }

    // Build a new frame
    iframe = new Iframe(dashboard, {
      ready: function() {
        // Sanity check: are we the first iframe?
        if (iframe !== this.queue[0]) {
          console.warn('[Dashkiosk] BUG: request to display a new iframe which is not in our queue',
                       iframe, this.queue);
          iframe.remove();
          return;
        }

        // Remove all other frames from the queue
        while (this.queue.length > 1) {
          var oldIframe = this.queue.pop();
          oldIframe.remove();
        }
        this.ready();
      }.bind(this)
    });

    // Put it in the queue
    this.queue.unshift(iframe);
  };

  return Queue;

})(window);
