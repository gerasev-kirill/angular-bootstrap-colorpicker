(function(){
'use strict';

window.lazyNgBootstrapColorPicker = window.lazyNgBootstrapColorPicker || {};


window.lazyNgBootstrapColorPicker.Helper = function () {
  return {
    closestSlider: function (elem) {
      var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
      if (matchesSelector.bind(elem)('I')) {
        return elem.parentNode;
      }
      return elem;
    },
    getOffset: function (elem, fixedPosition) {
      var
        scrollX = 0,
        scrollY = 0,
        rect = elem.getBoundingClientRect();
      while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
        if (!fixedPosition && elem.tagName === 'BODY') {
          scrollX += document.documentElement.scrollLeft || elem.scrollLeft;
          scrollY += document.documentElement.scrollTop || elem.scrollTop;
        } else {
          scrollX += elem.scrollLeft;
          scrollY += elem.scrollTop;
        }
        elem = elem.offsetParent;
      }
      return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        scrollX: scrollX,
        scrollY: scrollY
      };
    },
    // a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
    stringParsers: [
      {
        re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
        parse: function (execResult) {
          return [
            execResult[1],
            execResult[2],
            execResult[3],
            execResult[4]
          ];
        }
      },
      {
        re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
        parse: function (execResult) {
          return [
            2.55 * execResult[1],
            2.55 * execResult[2],
            2.55 * execResult[3],
            execResult[4]
          ];
        }
      },
      {
        re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
        parse: function (execResult) {
          return [
            parseInt(execResult[1], 16),
            parseInt(execResult[2], 16),
            parseInt(execResult[3], 16)
          ];
        }
      },
      {
        re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
        parse: function (execResult) {
          return [
            parseInt(execResult[1] + execResult[1], 16),
            parseInt(execResult[2] + execResult[2], 16),
            parseInt(execResult[3] + execResult[3], 16)
          ];
        }
      }
    ]
  };
};



window.lazyNgBootstrapColorPicker.Color = function() {
  var Helper = window.lazyNgBootstrapColorPicker.Helper();
  return {
    value: {
      h: 1,
      s: 1,
      b: 1,
      a: 1
    },
    // translate a format from Color object to a string
    'rgb': function () {
      var rgb = this.toRGB();
      return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
    },
    'rgba': function () {
      var rgb = this.toRGB();
      return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
    },
    'hex': function () {
      return  this.toHex();
    },

    // HSBtoRGB from RaphaelJS
    RGBtoHSB: function (r, g, b, a) {
      r /= 255;
      g /= 255;
      b /= 255;

      var H, S, V, C;
      V = Math.max(r, g, b);
      C = V - Math.min(r, g, b);
      H = (C === 0 ? null :
          V === r ? (g - b) / C :
              V === g ? (b - r) / C + 2 :
                  (r - g) / C + 4
          );
      H = ((H + 360) % 6) * 60 / 360;
      S = C === 0 ? 0 : C / V;
      return {h: H || 1, s: S, b: V, a: a || 1};
    },

    //parse a string to HSB
    setColor: function (val) {
      val = (val) ? val.toLowerCase() : val;
      for (var key in Helper.stringParsers) {
        if (Helper.stringParsers.hasOwnProperty(key)) {
          var parser = Helper.stringParsers[key];
          var match = parser.re.exec(val),
              values = match && parser.parse(match);
          if (values) {
            this.value = this.RGBtoHSB.apply(null, values);
            return false;
          }
        }
      }
    },

    setHue: function (h) {
      this.value.h = 1 - h;
    },

    setSaturation: function (s) {
      this.value.s = s;
    },

    setLightness: function (b) {
      this.value.b = 1 - b;
    },

    setAlpha: function (a) {
      this.value.a = parseInt((1 - a) * 100, 10) / 100;
    },

    // HSBtoRGB from RaphaelJS
    // https://github.com/DmitryBaranovskiy/raphael/
    toRGB: function (h, s, b, a) {
      if (!h) {
        h = this.value.h;
        s = this.value.s;
        b = this.value.b;
      }
      h *= 360;
      var R, G, B, X, C;
      h = (h % 360) / 60;
      C = b * s;
      X = C * (1 - Math.abs(h % 2 - 1));
      R = G = B = b - C;

      h = ~~h;
      R += [C, X, 0, 0, X, C][h];
      G += [X, C, C, X, 0, 0][h];
      B += [0, 0, X, C, C, X][h];
      return {
        r: Math.round(R * 255),
        g: Math.round(G * 255),
        b: Math.round(B * 255),
        a: a || this.value.a
      };
    },

    toHex: function (h, s, b, a) {
      var rgb = this.toRGB(h, s, b, a);
      return '#' + ((1 << 24) | (parseInt(rgb.r, 10) << 16) | (parseInt(rgb.g, 10) << 8) | parseInt(rgb.b, 10)).toString(16).substr(1);
    }
  };
};





window.lazyNgBootstrapColorPicker.Slider = function() {
  var Helper = window.lazyNgBootstrapColorPicker.Helper();
  var slider = {
        maxLeft: 0,
        maxTop: 0,
        callLeft: null,
        callTop: null,
        knob: {
          top: 0,
          left: 0
        }
      },
      pointer = {};

  return {
    getSlider: function() {
      return slider;
    },
    getLeftPosition: function(event) {
      return Math.max(0, Math.min(slider.maxLeft, slider.left + ((event.pageX || pointer.left) - pointer.left)));
    },
    getTopPosition: function(event) {
      return Math.max(0, Math.min(slider.maxTop, slider.top + ((event.pageY || pointer.top) - pointer.top)));
    },
    setSlider: function (event, fixedPosition) {
      var
        target = Helper.closestSlider(event.target),
        targetOffset = Helper.getOffset(target, fixedPosition),
        rect = target.getBoundingClientRect(),
        offsetX = event.clientX - rect.left,
        offsetY = event.clientY - rect.top;

      slider.knob = target.children[0].style;
      slider.left = event.pageX - targetOffset.left - window.pageXOffset + targetOffset.scrollX;
      slider.top = event.pageY - targetOffset.top - window.pageYOffset + targetOffset.scrollY;

      pointer = {
        left: event.pageX - (offsetX - slider.left),
        top: event.pageY - (offsetY - slider.top)
      };
    },
    setSaturation: function(event, fixedPosition, componentSize) {
      slider = {
        maxLeft: componentSize,
        maxTop: componentSize,
        callLeft: 'setSaturation',
        callTop: 'setLightness'
      };
      this.setSlider(event, fixedPosition);
    },
    setHue: function(event, fixedPosition, componentSize) {
      slider = {
        maxLeft: 0,
        maxTop: componentSize,
        callLeft: false,
        callTop: 'setHue'
      };
      this.setSlider(event, fixedPosition);
    },
    setAlpha: function(event, fixedPosition, componentSize) {
      slider = {
        maxLeft: 0,
        maxTop: componentSize,
        callLeft: false,
        callTop: 'setAlpha'
      };
      this.setSlider(event, fixedPosition);
    },
    setKnob: function(top, left) {
      slider.knob.top = top + 'px';
      slider.knob.left = left + 'px';
    }
  };
};





})();
