"use strict";

/* eslint-disable no-new */

/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */

/* eslint-disable consistent-return */

/* eslint no-extra-boolean-cast: 2 */

/* eslint no-eval: 0 */
var responsive = function () {
  function getResponsive() {
    if ($(window).width() < 1080) {
      $('body').addClass('isMobile').removeClass('isPc').trigger('changeDevice', ['mobile']);
    } else {
      $('body').removeClass('isMobile').addClass('isPc').trigger('changeDevice', ['pc']);
    }
  }

  return function () {
    getResponsive();
    $(window).on('resize ', function () {
      getResponsive();
    });
  };
}();

var customSelect = function () {
  var setSelect = function setSelect(el) {
    $(el).select2({
      width: '100%'
    }).on('select2:open', function () {
      $('.select2-results__options').scrollbar();
    });
  };

  return {
    init: function init(el) {
      setSelect(el);
    }
  };
}();

$(document).ready(function () {
  // uiGnb();
  customSelect.init('.select .select__selection');
  responsive();
});