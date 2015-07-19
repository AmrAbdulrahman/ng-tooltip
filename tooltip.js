'use strict';

angular.module('ng-tooltip', [])
.directive("tooltip", function($templateCache, $timeout) {
    $templateCache.put('ng-tooltip-template.html',
        ['<div ng-class="{animate: animate, open: visible}" class="smart-tooltip-wrapper"',
            'style="top: {{top}}px; left:{{left}}px; -webkit-transition-duration: {{animateTime}}ms; transition-duration: {{animateTime}}ms;">',
            '<div class="content">',
                '<div ng-transclude></div>',
                '<div class="arrow" ng-class="{',
                    'up: position === \'bottom\',',
                    'down: position === \'top\',',
                    'left: position === \'right\',',
                    'right: position === \'left\'}"></div>',
            '</div>',
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
                animateTime = attrs.animateTime || 500;

                scope.position = position;
                scope.visible = false;
                scope.top = 0;
                scope.left = 0;
                scope.animate = scope.$eval(animate);
                scope.animateTime = animateTime;

                function show() {
                    //  element/handle
                    var elem = $(handle),
                    elemHeight = elem.height(),
                    elemWidth = elem.width(),
                    eTop = elem.offset().top,
                    eLeft = elem.offset().left,

                    // tooltip content
                    content = $('.content', element),
                    contentHeight = content.height(),
                    contentWidth = content.width();

                    var arrowSize = 10;

                    if (position === 'bottom') {
                        scope.top = eTop + elemHeight + arrowSize;
                        scope.left = eLeft;
                    } else if (position === 'top') {
                        scope.top = eTop - contentHeight - arrowSize - 10;
                        scope.left = eLeft;
                    } else if (position === 'right') {
                        scope.top = eTop + (elemHeight / 2) - 20;
                        scope.left = eLeft + elemWidth + arrowSize;
                    } else if (position === 'left') {
                        scope.top = eTop + (elemHeight / 2) - 20;
                        scope.left = eLeft - contentWidth - arrowSize - 10;
                    }

                    scope.$apply(function () {
                        scope.visible = true;
                    });
                }

                function hide() {
                    scope.$apply(function () {
                        scope.visible = false;
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
            }

            $timeout(load, 0);
        }
    }
});