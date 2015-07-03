module.exports = (function(window) {
  'use strict';
  /* Socket.io related functions */

  function Viewport(spec) {
    if (!spec) {
      this.width = this.height = null;
      return;
    }
    var dimensions = spec.split('x');
    this.width = dimensions[0] || null;
    this.height = dimensions[1] || null;
  }

  Viewport.prototype.update = function() {
    if (!this.width && !this.height) {
      document.querySelector('meta[name="viewport"]')
        .setAttribute('content',
                      'width=device-width,user-scalable=no');
    } else {
      var vp = [ this.width?('width=' + this.width):'',
                 this.height?('height=' + this.height):'',
                 'user-scalable=no' ];
      document.querySelector('meta[name="viewport"]')
        .setAttribute('content',
                      vp.join(','));
    }
  };

  Viewport.prototype.adapt = function(el) {
    if (!this.width && !this.height) {
      return;                   // Nothing to do
    }
    var cw = window.document.documentElement.clientWidth,
        ch = window.document.documentElement.clientHeight,
        tw = this.width || this.height * cw / ch,
        th = this.height || this.width * ch / cw,
        scale = Math.min(cw / tw, ch / th);
    if (scale - 1 < 0.02 && scale - 1 > -0.02) {
      // Well, better not do anything
      console.info('[Dashkiosk] No need to rescale, viewport is already OK');
      return;
    }
    console.info('[Dashkiosk] Will apply a scale factor of ' + scale);

    tw = Math.round(tw);
    th = Math.round(th);
    scale = 'scale(' + scale + ')';
    el.style.width = tw + 'px';
    el.style.height = th + 'px';
    el.style.mozTransform = scale;
    el.style.webkitTransform = scale;
    el.style.transform = scale;
  };

  return Viewport;

})(window);
