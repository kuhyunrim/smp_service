/* eslint-disable no-lonely-if */
/*
  'no-plusplus': 0,
*/
((root, factory) => {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory;
  } else {
    root = factory(root);
  }
})(this, () => {
  const COMMON = {};
  (() => {
    COMMON.uuid = (() => {
      let uuid = 0;
      return (prefix) => {
        uuid += 1;

        let prefixName = '';
        if (prefix) {
          prefixName = prefix;
        } else {
          prefixName = '';
        }
        return prefixName + uuid;
      };
    })();

    COMMON.checkPrevId = ($element, pluginName) => {
      let piName = false;
      if ($element.attr('id').indexOf(pluginName) !== -1) {
        piName = false;
      } else {
        piName = true;
      }
      return piName;
    };

    COMMON.checkFocusibleElement = ($element) => {
      const tagName = $element[0].tagName.toLowerCase();

      let boolTagname = false;
      if (tagName === 'a' || tagName === 'button') {
        boolTagname = true;
      } else {
        boolTagname = false;
      }

      return boolTagname;
    };
  })();

  // toggle
  (() => {
    const pluginName = 'toggle';

    const defaults = {
      mode: 'static',
      event: 'click',
      speed: 300,
      easing: 'swing',
      anchorEl: '[data-element="toggle__anchor"]',
      panelEl: '[data-element="toggle__panel"]',
      onChangeBeforeText: null,
      onChangeAfterText: null,
      activeClassName: 'is-active',
      clickToClose: false,
      isOpened: false,
    };

    function Plugin(element, options) {
      const plugin = this;

      plugin.element = element;
      plugin.name = pluginName;
      plugin.defaults = defaults;
      plugin.options = $.extend({}, plugin.defaults, options);
      plugin.flag = false;
      plugin.textFlag = false;
      plugin.idx = 0;
      plugin.init();
    }

    $.extend(Plugin.prototype, {
      init() {
        const plugin = this;
        plugin.buildCache();
        plugin.bindEvents();
        if (plugin.options.isOpened) {
          plugin.open();
        } else {
          plugin.close();
        }
      },

      destroy() {
        const plugin = this;

        plugin.flag = false;
        plugin.textFlag = false;

        plugin.unbindEvents().removeCache();
        plugin.$element.removeData(`plugin_${plugin.name}`);
      },

      buildCache() {
        const plugin = this;
        plugin.$element = $(plugin.element);
        plugin.$anchor = plugin.$element.find(plugin.options.anchorEl);
        plugin.$panel = plugin.$element.find(plugin.options.panelEl);
        plugin.options.isOpened = plugin.$anchor.data('open');
        if (!COMMON.checkFocusibleElement(plugin.$anchor)) {
          plugin.$anchor.attr({
            role: 'button',
            tabIndex: 0,
          });
        }

        let elemId = '';
        if (plugin.$panel.attr('id')) {
          elemId = plugin.$panel.attr('id');
        } else {
          elemId = COMMON.uuid(`${plugin.name}-`);
        }

        plugin.$anchor.attr('aria-controls', elemId);
        plugin.$panel.attr({
          id: elemId,
        });

        if (
          plugin.options.onChangeAfterText !== null && plugin.options.onChangeBeforeText !== null
        ) {
          plugin.textFlag = true;
        }
      },

      removeCache() {
        const plugin = this;

        plugin.$anchor.removeAttr('aria-expended aria-controls tabindex role');
        plugin.$panel.removeAttr('aria-expended style');

        if (!COMMON.checkPrevId(plugin.$panel, plugin.name)) {
          plugin.$panel.removeAttr('id');
        }
      },

      bindEvents() {
        const plugin = this;

        const eventName = () => {
          const events = plugin.options.event;
          let returnEvent;
          if (events === 'focusin') {
            returnEvent = `focusin.${plugin.name} mouseenter.${plugin.name}`;
          } else if (events === 'click') {
            returnEvent = `click.${plugin.name} keydown.${plugin.name}`;
          } else {
            return `${events}.${plugin.name}`;
          }
          return returnEvent;
        };

        const event = eventName();

        plugin.$anchor.off(event).on(event, (e) => {
          e.stopPropagation();

          const key = e.witch || e.keyCode;

          if (
            e.type === 'click' || e.type === 'focusin' || key === 13 || key === 32
          ) {
            plugin.idx = $(this).data('index');
            plugin.toggle();
            e.preventDefault();
          }
        });

        plugin.$element
          .off(`show.${plugin.name}`)
          .on(`show.${plugin.name}`, () => {
            plugin.show();
          });

        plugin.$element
          .off(`hide.${plugin.name}`)
          .on(`hide.${plugin.name}`, () => {
            plugin.hide();
          });

        if (plugin.options.clickToClose) {
          $(document).on('click', (e) => {
            if (
              e.target !== plugin.$panel
              && $(e.target).closest(plugin.options.panelEl).length === 0
            ) {
              plugin.close();
            }
          });
        }
      },
      unbindEvents() {
        const plugin = this;

        plugin.$anchor.off(`.${plugin.name}`);
        plugin.$panel.off(`.${plugin.name}`);
      },
      beforeChange($anchor, $panel) {
        const plugin = this;

        plugin.$element.trigger('beforeChange', [plugin, $anchor, $panel]);
      },
      afterChange($anchor, $panel) {
        const plugin = this;

        plugin.$element.trigger('afterChange', [plugin, $anchor, $panel]);
      },
      toggle() {
        const plugin = this;

        if (plugin.flag) {
          plugin.close();
        } else {
          plugin.open();
        }
      },
      open() {
        const plugin = this;
        const option = plugin.options;

        plugin.flag = true;

        plugin.beforeChange(plugin.$anchor, plugin.$panel);

        if (plugin.textFlag) {
          plugin.$anchor.text(option.onChangeAfterText);
        }

        plugin.$anchor
          .addClass(option.activeClassName)
          .attr('aria-expended', true);

        if (option.parentClass) {
          plugin.$anchor
            .closest(option.parentClass)
            .addClass(option.activeClassName);
        }

        if (option.mode === 'fade') {
          plugin.$panel
            .stop()
            .fadeIn(
              option.speed,
              option.easing,
            );
        } else if (option.mode === 'slide') {
          plugin.$panel
            .stop()
            .slideDown(
              option.speed,
              option.easing,
            );
        } else {
          plugin.$panel.stop().show();
          plugin.afterChange(plugin.$anchor, plugin.$panel);
        }
        plugin.afterChange(plugin.$anchor, plugin.$panel);
      },
      close() {
        const plugin = this;
        const option = plugin.options;

        plugin.flag = false;

        plugin.beforeChange(plugin.$anchor, plugin.$panel);

        if (plugin.textFlag) {
          plugin.$anchor.text(option.onChangeBeforeText);
        }

        plugin.$anchor
          .removeClass(option.activeClassName)
          .attr('aria-expended', false);

        if (option.parentClass) {
          plugin.$anchor
            .closest(option.parentClass)
            .removeClass(option.activeClassName);
        }

        if (option.mode === 'fade') {
          plugin.$panel
            .stop()
            .fadeOut(
              option.speed,
              option.easing,

            );
        } else if (option.mode === 'slide') {
          plugin.$panel
            .stop()
            .slideUp(
              option.speed,
              option.easing,
            );
        } else {
          plugin.$panel
            .stop()
            .hide();
        }
        plugin.afterChange(plugin.$anchor, plugin.$panel);
      },
    });

    $.fn[pluginName] = function init(options) {
      return this.each((i, elem) => {
        if (!$.data(elem, `plugin_${pluginName}`)) {
          $.data(
            elem,
            `plugin_${pluginName}`,
            new Plugin(elem, options || $(elem).data('options')),
          );
        }
      });
    };

    $(() => {
      $('[data-element="toggle"]').toggle();
    });
  })();

  // tab
  (() => {
    const pluginName = 'tab';

    const defaults = {
      mode: 'static',
      event: 'click',
      speed: 300,
      easing: 'swing',
      list: '[data-element="tab__list"]',
      anchor: '[data-element="tab__anchor"]',
      panel: '[data-element="tab__panel"]',
      scroller: '[data-element="tab__scroll"]',
      scrollWrap: '[data-element="tab__scroll-wrap"]',
      direction: '[data-tab-direction]',
      offsets: [],
      activeClassName: 'is-active',
      disabledClassName: 'is-disabled',
      tabType: 'default',
      tabAlign: 'normal',
      bookingTab: false,
      autoScroll: false,
      isInitActive: true,
      initIndex: 0,
      linkedTab: false,
      activeTab: 0,
      firstScr: true,
    };

    function Plugin(element, options) {
      const plugin = this;

      plugin.element = element;
      plugin.name = pluginName;
      plugin.defaults = defaults;
      plugin.options = $.extend({}, plugin.defaults, options);
      plugin.flag = false;
      plugin.initialized = false;
      plugin.idx = 0;
      plugin.init();
    }

    $.extend(Plugin.prototype, {
      init() {
        const plugin = this;

        plugin.buildCache();
        plugin.bindEvents();

        if (plugin.options.isInitActive) {
          plugin.$anchor
            .eq(plugin.options.initIndex)
            .trigger(plugin.options.event);
        }
        plugin.getWidth();
      },
      destroy() {
        const plugin = this;

        plugin.index = 0;
        plugin.flag = false;
        plugin.initialized = false;

        plugin.$element.removeData(`plugin_${plugin.name}`);
        plugin
          .unbindEvents()
          .removeCache();
      },
      buildCache() {
        const plugin = this;
        const anchorId = [];

        plugin.$element = $(plugin.element);
        plugin.$anchor = plugin.$element.find(plugin.options.anchor);
        plugin.$list = plugin.$element.find(plugin.options.list);
        plugin.$direction = plugin.$element.find(plugin.options.direction);

        plugin.options.isBooking = true;
        plugin.options.offsets = [];

        if (plugin.options.linkedTab) {
          plugin.$panel = $(plugin.options.linkedTab).children(plugin.options.panel);
        } else {
          plugin.$panel = plugin.$element.find(plugin.options.panel);
        }
        plugin.$anchor.each((idx, el) => {
          const $this = $(el);
          const tabId = $this.attr('id') ? $this.attr('id') : COMMON.uuid(`plugin-${pluginName}-`);
          const focusible = COMMON.checkFocusibleElement($this);

          $this
            .data(`${plugin.name}_target`, plugin.$panel.eq(idx))
            .attr({
              'data-index': idx,
              id: tabId,
              role: 'tab',
              tabIndex: focusible ? '' : 0,
            });

          if (plugin.options.isBooking) {
            plugin.options.offsets
              .push(Math.round($this.position().left - (plugin.$anchor.position().left / 2)));
          } else {
            plugin.options.offsets
              .push($this.offset().left - plugin.$anchor.offset().left);
          }
          anchorId.push(tabId);
        });

        plugin.$panel.each((idx, el) => {
          const $this = $(el);

          $this.attr({
            'aria-labelledby': anchorId[idx],
            role: 'tabpanel',
            tabindex: 0,
          });
        });
        plugin.$element.find('.tab-wrap__menu').attr({
          role: 'tablist',
        });
        plugin.$list.attr({
          role: 'presentation',
        });
      },
      removeCache() {
        const plugin = this;

        plugin.$list.removeAttr('role');
        plugin.$anchor
          .removeData(`${plugin.name}_target`)
          .removeAttr('style role')
          .removeClass(plugin.options.activeClassName);
        plugin.$panel
          .removeAttr('style role aria-labelledby')
          .removeClass(plugin.options.activeClassName);
        if (!COMMON.checkPrevId(plugin.$panel, plugin.name)) {
          plugin.$panel.removeAttr('id');
        }
      },
      bindEvents() {
        const plugin = this;
        const $element = $(plugin.element);
        const $scrollWrap = $element.find(plugin.options.scrollWrap);
        const $scroller = $element.find(plugin.options.scroller);

        const eventName = (() => {
          const events = plugin.options.event;
          let event = '';
          if (events === 'focusin') {
            event = `focusin.${plugin.name} mounseenter.${plugin.name}`;
          } else if (events === 'click') {
            event = `click.${plugin.name} keydown.${plugin.name}`;
          } else {
            return `${events}.${plugin.name}`;
          }

          return event;
        });

        const event = eventName();

        if (plugin.options.swipe) {
          $scrollWrap.css({
            overflow: 'hidden',
          });

          $scroller.on(`touchstart.${plugin.name} touchend.${plugin.name}`, (e) => {
            plugin.swipeEvent(e);
          });
        }

        plugin.$direction.on(event, (e) => {
          let gotoIdx = plugin.options.activeTab;
          let targetElem = e.target;
          let $this;
          if (targetElem.tagName !== 'BUTTON' || targetElem.tagName !== 'A') {
            $this = $(targetElem).closest('button, a');

            // eslint-disable-next-line prefer-destructuring
            targetElem = $this[0];
          } else {
            $this = $(targetElem);
          }

          if ($this.data('tab-direction') === 'next') {
            if (plugin.$anchor.length - 1 === gotoIdx) {
              $this.addClass('disabled');
            } else {
              gotoIdx += 1;
              $this.removeClass('disabled');
            }
            // gotoIdx = plugin.$anchor.length - 1 === gotoIdx ? gotoIdx : gotoIdx + 1;
          } else {
            if (gotoIdx <= 0) {
              gotoIdx = 0;
              $this.addClass('disabled');
            } else {
              gotoIdx -= 1;
              $this.removeClass('disabled');
            }
            // gotoIdx = gotoIdx <= 0 ? 0 : gotoIdx - 1;
          }
          const gotoElem = plugin.$anchor[gotoIdx];
          plugin.close(gotoElem);
          plugin.open(gotoElem);
        });

        plugin.$anchor.on(event, (e) => {
          let targetElem = e.target;
          let $this;
          if (targetElem.tagName !== 'BUTTON' || targetElem.tagName !== 'A') {
            $this = $(targetElem).closest('button, a');

            // eslint-disable-next-line prefer-destructuring
            targetElem = $this[0];
          } else {
            $this = $(targetElem);
          }

          let returnValue = false;
          if ($this.hasClass(plugin.options.activeClassName)
            || $this.hasClass(plugin.options.disabledClassName)
            || plugin.flag) {
            returnValue = false;
          }
          const key = e.which;

          if (e.type === 'click'
          || e.type === 'focusin'
          || key === 13
          || key === 32) {
            plugin.idx = $(targetElem).data('index');
            plugin.close(targetElem);
            plugin.open(targetElem);
            e.preventDefault();
            e.stopPropagation();
          }
          return returnValue;
        });
      },
      unbindEvents() {
        const plugin = this;

        plugin.$anchor.off(`.${plugin.name}`);
        plugin.$element.off(`.${plugin.name}`);
      },
      beforeChange($anchor, $panel) {
        const plugin = this;

        plugin.$element.trigger('beforeChange', [
          plugin,
          $anchor,
          $panel,
        ]);
        plugin.getWidth();
      },
      afterChange($anchor, $panel) {
        const plugin = this;
        let linkedPanel;

        if (plugin.options.tabType === 'scroll' || plugin.options.tabType === 'booking') {
          linkedPanel = $(plugin.$panel[plugin.idx]).find('[data-element="tab"]');
          plugin.scrollTab($anchor);
        }

        plugin.$element.trigger('afterChange', [
          plugin,
          $anchor,
          $panel,
          linkedPanel,
        ]);
        plugin.getWidth();

        if (plugin.$element.find('[data-element="tab"]').length) {
          plugin.buildCache();
        }
        if (plugin.$direction.length) {
          if (plugin.options.activeTab === 0) {
            $(plugin.element).find('[data-tab-direction="prev"]').addClass('disabled');
          } else if (plugin.options.activeTab >= plugin.$anchor.length - 1) {
            $(plugin.element).find('[data-tab-direction="next"]').addClass('disabled');
          } else {
            plugin.$direction.removeClass('disabled');
          }
        }
        // plugin.reInit();
      },
      centerMode(scrollTo) {
        const plugin = this;
        const $element = $(plugin.element);
        // const $scrollWrap = $element.find(plugin.options.scrollWrap);
        const $scrollInner = $element.find(plugin.options.scroller);
        const $activated = plugin.$anchor.eq(plugin.options.initIndex);
        const positionLeft = $activated.outerWidth();
        const bookingScroller = $element.find('.booking-tab__scroller__inner');

        const width = bookingScroller.width() / 2;

        if ($(window).width() > 1080) {
          $scrollInner.css({
            transform: `translateX(${width - (scrollTo + (positionLeft * 2))}px)`,
          });
        } else {
          $scrollInner.css({
            transform: `translateX(${width - ((positionLeft * 2) + (scrollTo))}px)`,
          });
        }
      },
      swipeEvent(touch) {
        const plugin = this;
        let gotoIdx = plugin.options.activeTab;

        if (touch.type === 'touchstart') {
          plugin.options.touchFirst = touch.changedTouches[0].screenX;
        }

        const direction = plugin.options.touchFirst - touch.changedTouches[0].screenX;
        if (Math.abs(direction) > 50) {
          if (direction > 0) {
            if (gotoIdx === plugin.$anchor.length - 1) {
              gotoIdx = plugin.$anchor.length - 1;
            } else {
              gotoIdx += 1;
            }
          } else {
            if (gotoIdx <= 0) {
              gotoIdx = 1;
            }
            gotoIdx -= 1;
          }
          const targetElem = plugin.$anchor[gotoIdx];
          plugin.close(targetElem);
          plugin.open(targetElem);
        }
      },
      getWidth() {
        const plugin = this;
        const $element = $(plugin.element);
        const $scroller = $element.find(plugin.options.scroller);

        $scroller.width(() => {
          const list = $scroller.find(plugin.options.list);
          let width = 0;

          list.each((i, elem) => {
            width += Math.round($(elem).outerWidth(true));
          });

          return width;
        });
      },
      scrollTab(target) {
        const plugin = this;
        const $element = $(plugin.element);
        const $scrollWrap = $element.find(plugin.options.scrollWrap);
        const scrollTo = plugin.options.offsets[target.data('index')];

        // const anchorWidth = Math.round($(target).outerWidth());
        if (plugin.options.tabAlign === 'center') {
          plugin.centerMode(scrollTo);
        } else if ($scrollWrap.parents('.tab__scroll')) { // 고객정보 입력 탭, 탭버슨 사이즈 동일해야함
          $scrollWrap.stop().animate({
            scrollLeft: (target.outerWidth(true) + Number(target.parent().css('margin-left').replace(/[^0-9]/g, ''))) * target.data('index'),
          }, 300);
        } else {
          $scrollWrap.stop().animate({
            scrollLeft: scrollTo - 20,
          }, 300);
        }
      },
      open(target) {
        const plugin = this;
        const $anchor = $(target);
        const $panel = $anchor
          .addClass((plugin.options.activeClassName))
          .attr({
            'aria-selected': true,
            'aria-expended': true,
          })
          .data(`${plugin.name}_target`)
          .addClass(plugin.options.activeClassName);

        plugin.flag = true;
        plugin.options.activeTab = $anchor.data('index');
        plugin.beforeChange($anchor, $panel);

        if (plugin.options.mode === 'fade') {
          $panel
            .stop()
            .fadeIn(
              plugin.options.speed,
              plugin.options.easing,
              () => {
                plugin.flag = false;
                plugin.afterChange($anchor, $panel);
              },
            );
        } else if (plugin.options.mode === 'slide') {
          $panel
            .stop()
            .slideDown(
              plugin.options.speed,
              plugin.options.easing,
              () => {
                plugin.flag = false;
                plugin.afterChange($anchor, $panel);
              },
            );
        } else {
          $panel.stop().show();
          plugin.flag = false;
          plugin.afterChange($anchor, $panel);
        }

        if (plugin.options.autoScroll && plugin.initialized) {
          $('html, body')
            .stop()
            .animate({ scrollTop: plugin.$element.offset().top }, plugin.options.speed);
        }
      },
      close(target) {
        const plugin = this;

        plugin.$anchor.not(target).each((i, elem) => {
          const $panel = $(elem)
            .removeClass(plugin.options.activeClassName)
            .attr({
              'aria-selected': false,
              'aria-expended': false,
            })
            .data(`${plugin.name}_target`)
            .removeClass(plugin.options.activeClassName);

          if (plugin.options.mode === 'fade') {
            $panel
              .stop()
              .fadeOut(
                plugin.options.speed,
                plugin.options.easing,
              );
          } else if (plugin.options.mode === 'slide') {
            $panel
              .stop()
              .slideUp(
                plugin.options.speed,
                plugin.options.easing,
              );
          } else {
            $panel.stop().hide();
          }
        });
      },
      go(idx, autoScroll) {
        const plugin = this;

        plugin.$anchor.eq(idx).trigger(plugin.options.event);

        if (autoScroll && plugin.initialized) {
          $('html, body')
            .stop()
            .animate({
              scrollTop: plugin.$element.offset().top,
            },
            plugin.options.speed);
        }
      },
      reInit() {
        const plugin = this;

        plugin.idx = 0;
        plugin.flag = false;
        plugin.initialized = false;

        plugin.unbindEvents();
        plugin.removeCache();
        plugin.init();
      },
    });

    $.fn[pluginName] = function init(options) {
      return this.each((i, elem) => {
        if (!$.data(elem, `plugin_${pluginName}`)) {
          $.data(
            elem,
            `plugin_${pluginName}`,
            new Plugin(elem, options || $(elem).data('options')),
          );
        }
      });
    };
    $(() => {
      $('[data-element="tab"]').tab();
    });
  })();

  // image upload
  (() => {
    const pluginName = 'uploader';

    const defaults = {
      max: 3,
      wrapperClass: 'file',
      imageClass: 'file__image',
      item: '[data-element="file__input"]',
      wrap: '[data-element="file__wrap"]',
      clear: '[data-element="file__remove"]',
      label: '[data-element="file__label"]',
      images: '[data-element="file__images"]',
      image: '[data-element="file__image"]',
      countWrap: '[data-element="count__file"]',
      countCurrent: '[data-element="count__current"]',
      countMax: '[data-element="count__max"]',
      imageWrap: '<div data-element="file__image" />',
      clearButton: '<button type="button" class="file__clear" data-element="file__remove" />',
      leng: 0,
      imageMax: 8,
    };

    function Plugin(element, options) {
      const plugin = this;

      plugin.element = element;
      plugin.name = pluginName;
      plugin.defaults = defaults;
      plugin.options = $.extend({}, plugin.defaults, options);
      plugin.flag = false;
      plugin.initialized = false;
      plugin.init();
    }

    $.extend(Plugin.prototype, {
      init() {
        const plugin = this;

        plugin.bindCache();
        plugin.bindEvents();
      },
      bindCache() {
        const plugin = this;

        plugin.$element = $(plugin.element);
        plugin.$anchor = plugin.$element.find(plugin.options.label);
        plugin.$file = plugin.$element.find(plugin.options.item);
        plugin.$images = plugin.$element.find(plugin.options.images);
        plugin.$counter = $(plugin.options.countWrap);

        plugin.$counter.each((idx, el) => {
          plugin.$countCurrent = $(el).find(plugin.options.countCurrent);
          plugin.$countMax = $(el).find(plugin.options.countMax);
          plugin.options.imageMax = plugin.$countMax[0].innerHTML * 1;
        });

        plugin.$anchor.each((idx, el) => {
          const $this = $(el);
          const $for = $this.attr('for') ? $this.attr('for') : COMMON.uuid(`plugin-${plugin.name}-`);
          const $id = $this.attr('id') ? $this.attr('id') : COMMON.uuid(`plugin-${plugin.name}-label-`);
          $this
            .attr({
              id: $id,
              for: $for,
              tabIndex: 0,
            })
            .siblings(plugin.options.item)
            .attr({
              id: $for,
              multiple: true,
              'aria-labelledby': $id,
            });
        });
      },
      bindEvents() {
        const plugin = this;

        plugin.$anchor.off('click keydown').on('click keydown', (e) => {
          e.stopPropagation();
          plugin.$file.trigger('click');
          e.preventDefault();
        });

        plugin.$file.on('change', (e) => {
          const file = e.target.files;

          plugin.addImage(file);
          plugin.countImage();
        });

        plugin.$images.off('click').on('click', plugin.options.clear, (e) => {
          plugin.removeImage(e.target);
          plugin.countImage();
        });
      },
      addImage(file) {
        const plugin = this;
        $(file).each((i, el) => {
          const temp = plugin.options;
          const item = plugin.$images.append(temp.imageWrap);
          const image = URL.createObjectURL(el);
          let wrapper = '';

          if (temp.leng < temp.imageMax) {
            item.find('div:last-child').addClass(temp.imageClass);
            wrapper = plugin.$images.find(`.${temp.imageClass}:last-child`);
            if (item.hasClass('file--pdf__images')) {
              wrapper.append(`<p>${file[i].name}</p>${temp.clearButton}`);
            } else {
              wrapper.append(`<img src="${image}" alt="${file[i].name}">${temp.clearButton}`);
            }
            temp.leng += 1;
          }
          // console.log(temp.leng);

          plugin.afterChange(plugin.$images);
        });
      },
      removeImage(btn) {
        const plugin = this;
        const temp = plugin.options;
        const $button = $(btn);
        const wrap = $button.closest(temp.image);
        wrap.remove();
        temp.leng -= 1;
        plugin.afterChange(plugin.$images);
      },
      countImage() {
        const plugin = this;
        const temp = plugin.options;

        if (plugin.$countCurrent) {
          plugin.$countCurrent.text(temp.leng);
        }
      },
      afterChange($target) {
        const plugin = this;

        plugin.$element.trigger('afterChange', [
          plugin,
          $target,
        ]);
      },
    });

    $.fn[pluginName] = function init(options) {
      return this.each((i, elem) => {
        if (!$.data(elem, `plugin_${pluginName}`)) {
          $.data(
            elem,
            `plugin_${pluginName}`,
            new Plugin(elem, options || $(elem).data('options')),
          );
        }
      });
    };

    $(() => {
      $('[data-element="file__wrap"]').uploader();
    });
  })();

  // accordion
  (() => {
    const pluginName = 'accordion';

    const defaults = {
      mode: 'slide',
      speed: 200,
      easing: 'linear',
      item: '[data-element="accordion__item"]',
      anchor: '[data-element="accordion__anchor"]',
      panel: '[data-element="accordion__panel"]',
      activeClassName: 'is-active',
      initIndex: 0,
      isInitActive: false,
      autoFold: true,
      autoScroll: false,
    };

    function Plugin(element, options) {
      const plugin = this;

      plugin.element = element;
      plugin.name = pluginName;
      plugin.defaults = defaults;
      plugin.options = $.extend({}, plugin.defaults, options);
      plugin.flag = false;
      plugin.initialized = false;
      plugin.init();
    }

    $.extend(Plugin.prototype, {
      init() {
        const plugin = this;

        plugin.buildCache();
        plugin.bindEvents();
        if (plugin.options.isInitActive) {
          plugin.open(plugin.$anchor.eq(plugin.options.initIndex));
        }
        plugin.initialized = true;
      },
      destroy() {
        const plugin = this;

        plugin.flag = false;
        plugin.initialized = false;
        plugin.$element.removeData(`plugin_${plugin.name}`);
        plugin.unbindEvents().removeCache();
      },
      buildCache() {
        const plugin = this;

        plugin.$element = $(plugin.element).attr(
          'role',
          'presentation',
        );

        plugin.$header = plugin.$element.find(plugin.options.item);
        plugin.$anchor = plugin.$element.find(plugin.options.anchor);
        plugin.$panel = plugin.$element.find(plugin.options.panel).hide();

        const tabsId = [];

        plugin.$anchor.each((idx, elem) => {
          const $this = $(elem);
          let anchorId;

          if ($this.attr('id')) {
            anchorId = $this.attr('id');
          } else {
            anchorId = COMMON.uuid(`plugin-${plugin.name}-`);
          }

          $this
            .data(`${plugin.name}_target`, plugin.$panel.eq(idx))
            .data('title', $.trim($this.text()))
            .attr({
              id: anchorId,
              'aria-expanded': false,
              'aria-controls': `${anchorId}-panel`,
            });
          tabsId.push(anchorId);
        });

        plugin.$panel.each((idx, elem) => {
          $(elem)
            .attr({
              'aria-labelledby': tabsId[idx],
              role: 'region',
            })
            .hide();
        });
      },
      removeCache() {
        const plugin = this;

        plugin.$anchor
          .removeData(`${plugin.name}_target`)
          .removeData('title')
          .removeAttr('id aria-expanded aria-controls')
          .removeClass(plugin.options.activeClassName);

        plugin.$panel
          .removeAttr('aria-labeledby role')
          .removeClass(plugin.options.activeClassName);

        if (!COMMON.checkPrevId(plugin.$anchor, plugin.name)) {
          plugin.$anchor.removeAttr('id');
        }
      },
      bindEvents() {
        const plugin = this;

        plugin.$element.on(`click.${plugin.name}`, plugin.options.anchor, (e) => {
          e.stopPropagation();
          e.preventDefault();

          let target = $(e.target);

          if (e.target.tagName !== 'BUTTON' || e.target.tagName !== 'A') {
            target = $($(e.target).closest(plugin.options.anchor));
          }
          if (target.attr('disabled') !== 'disabled') {
            plugin.toggle(target);
          }
        });

        plugin.$anchor.on(`open.${plugin.name}`, (e) => {
          plugin.open($(e.target));
        });
        plugin.$anchor.on(`close.${plugin.name}`, (e) => {
          plugin.close($(e.target));
        });
      },
      unbindEvents() {
        const plugin = this;

        plugin.$element.off(`.${plugin.name}`);
        plugin.$header.off(`.${plugin.name}`);
      },
      beforeChange($activeTarget) {
        const plugin = this;

        plugin.$element.trigger('beforeChange', [
          plugin,
          $activeTarget,
        ]);
      },
      afterChange($activeTarget) {
        const plugin = this;

        plugin.$element.trigger('afterChange', [
          plugin,
          $activeTarget,
        ]);
      },
      toggle($targetAnchor) {
        const plugin = this;

        plugin.flag = true;

        if ($targetAnchor.hasClass(plugin.options.activeClassName)) {
          plugin.close($targetAnchor);
        } else {
          plugin.open($targetAnchor);
        }
      },
      open($targetAnchor) {
        const plugin = this;

        plugin.beforeChange($targetAnchor);

        const $panel = $targetAnchor
          .attr('aria-expanded', true)
          .addClass(plugin.options.activeClassName)
          .data(`${plugin.name}_target`)
          .addClass(plugin.options.activeClassName);

        if (plugin.initialized && plugin.options.mode === 'slide') {
          $panel
            .stop()
            .slideDown(
              plugin.options.speed,
              plugin.options.easing,
              () => {
                plugin.flag = false;

                if (plugin.options.autoScroll) {
                  $('html, body')
                    .stop()
                    .animate({ scrollTop: $targetAnchor.offset().top }, 100);
                }
              },
            );
        } else {
          $panel.stop().show();
          plugin.flag = false;
        }

        if (plugin.options.autoFold) {
          plugin.$anchor.not($targetAnchor).each((i, elem) => {
            plugin.close($(elem));
          });
        }

        plugin.afterChange($targetAnchor);
      },
      close($targetAnchor) {
        const plugin = this;

        plugin.beforeChange($targetAnchor);

        const $panel = $targetAnchor
          .attr('aria-expanded', false)
          .removeClass(plugin.options.activeClassName)
          .data(`${plugin.name}_target`)
          .removeClass(plugin.options.activeClassName);

        if (plugin.options.mode === 'slide') {
          $panel
            .stop()
            .slideUp(
              plugin.options.speed,
              plugin.options.easing,
              () => {
                plugin.flag = false;
              },
            );
        } else {
          $panel.stop().hide();
          plugin.flag = false;
        }
      },
      go(idx, autoScroll) {
        const plugin = this;

        plugin.$anchor.eq(idx).trigger('click');

        if (autoScroll) {
          plugin.autoScroll();
        }
      },
      autoScroll() {
        const plugin = this;

        $('html, body')
          .stop()
          .animate({ scrollTop: plugin.$wrap.offset().top }, plugin.options.speed);
      },
      reInit() {
        const plugin = this;

        plugin.flag = false;
        plugin.initialized = false;

        plugin
          .unbindEvents()
          .removeCache()
          .init();
      },
    });

    $.fn[pluginName] = function init(options) {
      return this.each((i, elem) => {
        if (!$.data(elem, `plugin_${pluginName}`)) {
          $.data(
            elem,
            `plugin_${pluginName}`,
            new Plugin(elem, options || $(elem).data('options')),
          );
        }
      });
    };

    $(() => {
      $('[data-element=accordion]').accordion();
    });
  })();
});
