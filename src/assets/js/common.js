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

$(document).ready(() => {
  // uiGnb();
  responsive();

  $('.accordian-button button').click(function(){
    // var accordianActive = $(this).parents('.accordian-wrapper').hasClass('active');
    if(accordianActive == true){
      $(this).parents('.accordian-wrapper').removeClass('active');
      $(this).parents('.accordian-header').next('.accordian-content').hide();
      console.log(1);
    }else{
      $(this).parents('.accordian-wrapper').addClass('active');
      $(this).parents('.accordian-header').next('.accordian-content').show();
    }
  });
});
