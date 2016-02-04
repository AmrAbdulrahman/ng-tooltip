'use strict';

angular.module('ng-tooltip', [])
    .directive('tooltip', function ($templateCache, $timeout, $window) {
        $templateCache.put('ng-tooltip-template.html', [
            '<div ng-class="{animate: animate, open: visible}" class="smart-tooltip-wrapper"',
            '   style="top: {{top}}px; left:{{left}}px; -webkit-transition-duration: {{animateTime}}ms; transition-duration: {{animateTime}}ms;">',
            '   <div class="tooltip-content {{cssClass}}" style="border-color: {{borderColor}}; border-width: {{borderWidth}};">',
            '       <div ng-transclude></div>',
            '       <div ng-if="arrow" class="arrow" ng-class="{',
            '           up: position === \'bottom\',',
            '           down: position === \'top\',',
            '           left: position === \'right\',',
            '           right: position === \'left\'}"',
            '           style="border-color: {{borderColor}}; border-width: {{borderWidth}}; ',
            '           top: {{arrowTopOffset}}; left: {{arrowLeftOffset}}; width: {{arrowSize}}px; height: {{arrowSize}}px;',
            '           top: {{arrowTop}}px;"></div>',
            '       </div>',
            '</div>'].join('')
        );

        return {
            restrict: 'E',
            template: $templateCache.get('ng-tooltip-template.html'),
            replace: true,
            transclude: true,
            scope: {},
            link: function(scope, element, attrs) {

                function load() {
                    var on = attrs.on || 'hover',
                        handle = '#' + attrs.handle,
                        position = attrs.position || 'bottom',
                        animate = attrs.animate || 'true',
                        animateTime = attrs.animateTime || 500,
                        arrow = attrs.arrow || 'true',
                        arrowSize = attrs.arrowSize || 10,
                        arrowTopOffset = attrs.arrowTopOffset || '10px',
                        arrowLeftOffset = attrs.arrowLeftOffset || '10px';

                    // don't use both options at the same time
                    if(position === 'top' || position === 'bottom') {
                        arrowTopOffset = '';
                    } else {
                        arrowLeftOffset = '';
                    }

                    if(isNaN(arrowSize)) {
                        arrowSize = scope.$eval(arrowSize);
                    }

                    if(position === 'bottom') {
                        scope.arrowTop = ((arrowSize / 2) * -1) - 1; // negate half size - 1px (border)
                    }

                    scope.position = position;
                    scope.visible = false;
                    scope.top = -1000;
                    scope.left = 0;
                    scope.animate = scope.$eval(animate);
                    scope.animateTime = animateTime;
                    scope.cssClass = attrs.cssClass;
                    scope.borderWidth = attrs.borderWidth;
                    scope.borderColor = attrs.borderColor;
                    scope.arrow = scope.$eval(arrow);
                    scope.arrowSize = arrowSize;
                    scope.arrowTopOffset = arrowTopOffset;
                    scope.arrowLeftOffset = arrowLeftOffset;

                    function cssSize(elem) {
                        var heightPX = $(elem).css('height'),
                            heightPXIndex = heightPX.indexOf('px'),
                            heightStr = heightPXIndex !== -1 ? heightPX.substr(0, heightPXIndex) : heightPX,
                            height = parseInt(heightStr),
                            widthPX = $(elem).css('width'),
                            widthPXIndex = widthPX.indexOf('px'),
                            widthStr = widthPXIndex !== -1 ? widthPX.substr(0, widthPXIndex) : widthPX,
                            width = parseInt(widthStr);

                        return {
                            height: height,
                            width: width
                        };
                    }

                    function show() {
                        scope.disabled = scope.$parent.$eval(attrs.disabled || 'false');

                        if(scope.disabled) {
                            return;
                        }

                        //  element/handle
                        var elem = $(handle),
                            elemSize = cssSize(elem),
                            elemHeight = elemSize.height,
                            elemWidth = elemSize.width,
                            eTop = elem.offset().top,
                            eLeft = elem.offset().left,

                        // tooltip content
                            content = $('.tooltip-content', element),
                            contentSize = cssSize(content),
                            contentHeight = contentSize.height,
                            contentWidth = contentSize.width;

                        if (position === 'bottom') {
                            scope.top = eTop + elemHeight + arrowSize;
                            scope.left = eLeft;
                        } else if (position === 'top') {
                            scope.top = eTop - contentHeight - arrowSize;
                            scope.left = eLeft;
                        } else if (position === 'right') {
                            scope.top = eTop + (elemHeight / 2) - 20;
                            scope.left = eLeft + elemWidth + arrowSize;
                        } else if (position === 'left') {
                            scope.top = eTop + (elemHeight / 2) - 20;
                            scope.left = eLeft - contentWidth - arrowSize;
                        }

                        scope.top -= $(window).scrollTop();
                        scope.left -= $(window).scrollLeft();

                        scope.$apply(function () {
                            scope.visible = true;
                        });
                    }

                    function hide() {
                        scope.$apply(function () {
                            scope.visible = false;
                            scope.top = -1000;
                        });
                    }

                    if (on === 'hover') {
                        $(handle).hover(function () {
                            show();
                        });

                        $(handle).mouseleave(function () {
                            hide();
                        });

                    } else if (on === 'click') {
                        $(handle).click(function () {
                            show();
                        });

                        $(document).click(function (e) {
                            var tooltip = element;

                            if ($(handle).is(e.target) || $(handle).has(e.target).length > 0) {
                                e.preventDefault();
                                return;
                            }

                            if (tooltip.is(e.target) === false &&
                                tooltip.has(e.target).length === 0 &&
                                scope.visible === true) {
                                hide();
                            }
                        });
                    }

                    scope.$watch(function() {
                        return $(handle).offset().left;
                    }, function() {
                        if(scope.visible === true) {
                            $timeout(show, 0);
                        }
                    });

                    // watch scroll
                    angular.element($window).bind('scroll', function() {
                        if(scope.visible === true) {
                            $timeout(show, 0);
                        }
                    });
                }

                $timeout(load, 0);
            }
        }
    });