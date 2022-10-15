/* eslint-disable no-new */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint no-extra-boolean-cast: 2 */
/* eslint no-eval: 0 */

const responsive = (() => {
  function getResponsive() {
    if ($(window).width() < 1080) {
      $('body')
        .addClass('isMobile')
        .removeClass('isPc')
        .trigger('changeDevice', ['mobile']);
    } else {
      $('body')
        .removeClass('isMobile')
        .addClass('isPc')
        .trigger('changeDevice', ['pc']);
    }
  }

  return () => {
    getResponsive();
    $(window).on('resize ', () => {
      getResponsive();
    });
  };
})();

const customSelect = (() => {
  const setSelect = (el) => {
    $(el).select2({
      width: '100%',
    }).on('select2:open', () => {
      $('.select2-results__options').scrollbar();
    });
  };

  return {
    init(el) {
      setSelect(el);
    },
  };
})();

$(document).ready(() => {
  // uiGnb();
  customSelect.init('.select .select__selection');
  responsive();
});
