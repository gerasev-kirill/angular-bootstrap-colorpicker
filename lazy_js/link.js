(function(){
'use strict';
//добавление css в страницу. -1 лишний запрос
try{
    !angular.$$csp().noInlineStyle  &&  !angular.$$uibColorpickerCss  &&  angular.element(document).find('head').prepend(CSS_UIB_COLORPICKER_APP);
    angular.$$uibColorpickerCss = true;
}catch (e){}


window.lazyNgBootstrapColorPicker = window.lazyNgBootstrapColorPicker || {};

window.lazyNgBootstrapColorPicker.generateLinkFunction = function($injector){
    var $document = $injector.get('$document'),
        $compile = $injector.get('$compile'),
        Color = window.lazyNgBootstrapColorPicker.Color(),
        Slider = window.lazyNgBootstrapColorPicker.Slider(),
        Helper = window.lazyNgBootstrapColorPicker.Helper();


    return function($scope, elem, attrs, ngModel) {
          if (elem[0].tagName.toLowerCase() != 'input'){
              elem = angular.element(elem.find('input'));
          }
          var
              thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
              position = angular.isDefined(attrs.colorpickerPosition) ? attrs.colorpickerPosition : 'bottom',
              inline = angular.isDefined(attrs.colorpickerInline) ? attrs.colorpickerInline : false,
              fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
              target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body),
              withInput = angular.isDefined(attrs.colorpickerWithInput) ? attrs.colorpickerWithInput : false,
              componentSize = angular.isDefined(attrs.colorpickerSize) ? attrs.colorpickerSize : 100,
              componentSizePx = componentSize + 'px',
              inputTemplate = withInput ? '<input type="text" name="colorpicker-input" spellcheck="false">' : '',
              closeButton = !inline ? '<button type="button" class="close close-colorpicker">&times;</button>' : '',
              template =
                  '<div class="colorpicker dropdown">' +
                      '<div class="dropdown-menu">' +
                      '<colorpicker-saturation><i></i></colorpicker-saturation>' +
                      '<colorpicker-hue><i></i></colorpicker-hue>' +
                      '<colorpicker-alpha><i></i></colorpicker-alpha>' +
                      '<colorpicker-preview></colorpicker-preview>' +
                      inputTemplate +
                      closeButton +
                      '</div>' +
                      '</div>',
              colorpickerTemplate = angular.element(template),
              pickerColor = Color,
              colorpickerValue = {
                h: 1,
                s: 0,
                b: 1,
                a: 1
              },
              sliderAlpha,
              sliderHue = colorpickerTemplate.find('colorpicker-hue'),
              sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
              colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
              pickerColorPointers = colorpickerTemplate.find('i'),
              componentWidthWithToolbars = parseInt(componentSize) + 29 + (thisFormat === 'rgba' ? 15 : 0),
              componentHeightWithToolbars = parseInt(componentSize) + 55;

          $compile(colorpickerTemplate)($scope);
          colorpickerTemplate.css('min-width', componentWidthWithToolbars + 'px');
          sliderSaturation.css({
            'width' : componentSizePx,
            'height' : componentSizePx
          });
          sliderHue.css('height', componentSizePx);

          if (withInput) {
            var pickerColorInput = colorpickerTemplate.find('input');
            pickerColorInput.css('width', componentSizePx);
            pickerColorInput
                .on('mousedown', function(event) {
                  event.stopPropagation();
                })
              .on('keyup', function() {
                var newColor = this.value;
                elem.val(newColor);
                if (ngModel && ngModel.$modelValue !== newColor) {
                  $scope.$apply(ngModel.$setViewValue(newColor));
                  update(true);
                }
              });
          }

          function bindMouseEvents() {
            $document.on('mousemove', mousemove);
            $document.on('mouseup', mouseup);
          }

          if (thisFormat === 'rgba') {
            colorpickerTemplate.addClass('alpha');
            sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
            sliderAlpha.css('height', componentSizePx);
            sliderAlpha
                .on('click', function(event) {
                  Slider.setAlpha(event, fixedPosition, componentSize);
                  mousemove(event);
                })
                .on('mousedown', function(event) {
                  Slider.setAlpha(event, fixedPosition, componentSize);
                  bindMouseEvents();
                })
                .on('mouseup', function(event){
                  emitEvent('colorpicker-selected-alpha');
                });
          }

          sliderHue
              .on('click', function(event) {
                Slider.setHue(event, fixedPosition, componentSize);
                mousemove(event);
              })
              .on('mousedown', function(event) {
                Slider.setHue(event, fixedPosition, componentSize);
                bindMouseEvents();
              })
              .on('mouseup', function(event){
                emitEvent('colorpicker-selected-hue');
              });

          sliderSaturation
              .on('click', function(event) {
                Slider.setSaturation(event, fixedPosition, componentSize);
                mousemove(event);
                if (angular.isDefined(attrs.colorpickerCloseOnSelect)) {
                  hideColorpickerTemplate();
                }
              })
              .on('mousedown', function(event) {
                Slider.setSaturation(event, fixedPosition, componentSize);
                bindMouseEvents();
              })
              .on('mouseup', function(event){
                emitEvent('colorpicker-selected-saturation');
              });

          if (fixedPosition) {
            colorpickerTemplate.addClass('colorpicker-fixed-position');
          }

          colorpickerTemplate.addClass('colorpicker-position-' + position);
          if (inline === 'true') {
            colorpickerTemplate.addClass('colorpicker-inline');
          }

          target.append(colorpickerTemplate);

          if (ngModel) {
            ngModel.$render = function () {
              elem.val(ngModel.$viewValue);

              update();
            };
          }

          elem.on('blur keyup change', function() {
            update();
          });

          elem.on('$destroy', function() {
            colorpickerTemplate.remove();
          });

          function previewColor() {
            try {
              colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
            } catch (e) {
              colorpickerPreview.css('backgroundColor', pickerColor.toHex());
            }
            sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
            if (thisFormat === 'rgba') {
              sliderAlpha.css.backgroundColor = pickerColor.toHex();
            }
          }

          function mousemove(event) {
            var
                left = Slider.getLeftPosition(event),
                top = Slider.getTopPosition(event),
                slider = Slider.getSlider();

            Slider.setKnob(top, left);

            if (slider.callLeft) {
              pickerColor[slider.callLeft].call(pickerColor, left / componentSize);
            }
            if (slider.callTop) {
              pickerColor[slider.callTop].call(pickerColor, top / componentSize);
            }
            previewColor();
            var newColor = pickerColor[thisFormat]();
            elem.val(newColor);
            if (ngModel) {
              $scope.$apply(ngModel.$setViewValue(newColor));
            }
            if (withInput) {
              pickerColorInput.val(newColor);
            }
            return false;
          }

          function mouseup() {
            emitEvent('colorpicker-selected');
            $document.off('mousemove', mousemove);
            $document.off('mouseup', mouseup);
          }

          function update(omitInnerInput) {
            pickerColor.value = colorpickerValue;
            pickerColor.setColor(elem.val());
            if (withInput && !omitInnerInput) {
              pickerColorInput.val(elem.val());
            }
            pickerColorPointers.eq(0).css({
              left: pickerColor.value.s * componentSize + 'px',
              top: componentSize - pickerColor.value.b * componentSize + 'px'
            });
            pickerColorPointers.eq(1).css('top', componentSize * (1 - pickerColor.value.h) + 'px');
            pickerColorPointers.eq(2).css('top', componentSize * (1 - pickerColor.value.a) + 'px');
            colorpickerValue = pickerColor.value;
            previewColor();
          }

          function getColorpickerTemplatePosition() {
            var
                positionValue,
                positionOffset = Helper.getOffset(elem[0]),
                additionalSpaceBetweenElements = 2;

            if(angular.isDefined(attrs.colorpickerParent)) {
              positionOffset.left = 0;
              positionOffset.top = 0;
            }

            if (position === 'top') {
              positionValue =  {
                'top': positionOffset.top - componentHeightWithToolbars - additionalSpaceBetweenElements,
                'left': positionOffset.left
              };
            } else if (position === 'right') {
              positionValue = {
                'top': positionOffset.top,
                'left': positionOffset.left + elem[0].offsetWidth + additionalSpaceBetweenElements
              };
            } else if (position === 'bottom') {
              positionValue = {
                'top': positionOffset.top + elem[0].offsetHeight + additionalSpaceBetweenElements,
                'left': positionOffset.left
              };
            } else if (position === 'left') {
              positionValue = {
                'top': positionOffset.top,
                'left': positionOffset.left - componentWidthWithToolbars - additionalSpaceBetweenElements
              };
            }
            return {
              'top': positionValue.top + 'px',
              'left': positionValue.left + 'px'
            };
          }

          function documentMousedownHandler() {
            hideColorpickerTemplate();
          }

          function showColorpickerTemplate() {

            if (!colorpickerTemplate.hasClass('colorpicker-visible')) {
              update();
              colorpickerTemplate
                .addClass('colorpicker-visible')
                .css(getColorpickerTemplatePosition());
              emitEvent('colorpicker-shown');

              if (inline === false) {
                // register global mousedown event to hide the colorpicker
                $document.on('mousedown', documentMousedownHandler);
              }

              if (attrs.colorpickerIsOpen) {
                $scope[attrs.colorpickerIsOpen] = true;
                if (!$scope.$$phase || !$scope.$root.$$phase) {
                  $scope.$digest(); //trigger the watcher to fire
                }
              }
            }
          }

          if (inline === false) {
            elem.on('click', showColorpickerTemplate);
          } else {
            showColorpickerTemplate();
          }

          colorpickerTemplate.on('mousedown', function (event) {
            event.stopPropagation();
            event.preventDefault();
          });

          function emitEvent(name) {
            if (ngModel) {
              $scope.$emit(name, {
                name: attrs.ngModel,
                value: ngModel.$modelValue
              });
            }
          }

          function hideColorpickerTemplate() {
            if (colorpickerTemplate.hasClass('colorpicker-visible')) {
              colorpickerTemplate.removeClass('colorpicker-visible');
              emitEvent('colorpicker-closed');
              // unregister the global mousedown event
              $document.off('mousedown', documentMousedownHandler);

              if (attrs.colorpickerIsOpen) {
                $scope[attrs.colorpickerIsOpen] = false;
                if (!$scope.$$phase || !$scope.$root.$$phase) {
                  $scope.$digest(); //trigger the watcher to fire
                }
              }
            }
          }

          colorpickerTemplate.find('button').on('click', function () {
            hideColorpickerTemplate();
          });

          if (attrs.colorpickerIsOpen) {
            $scope.$watch(attrs.colorpickerIsOpen, function(shouldBeOpen) {

              if (shouldBeOpen === true) {
                showColorpickerTemplate();
              } else if (shouldBeOpen === false) {
                hideColorpickerTemplate();
              }

            });
          }


    };
};



})();
