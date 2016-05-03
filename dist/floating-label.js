(function(angular) {
    'use strict';

    var app = angular.module('components', ['ngMessages', 'ngAnimate']);
	app.config(function($logProvider){
		$logProvider.debugEnabled(true);
	});
})(window.angular);
(function (angular) {
	var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'];

	function addDefaultsToObject(object, defaults) {
		for(var prop in defaults) {
			if(!object.hasOwnProperty(prop)) {
				object[prop] = defaults[prop];
			}
		}
	}
	function agHintsDirective($compile, $timeout) {
		return {
			restrict: 'EA',
			// scope : {
			// 	options : '=?' // make it optional
			// },
			priority : 1,
			require: '^^?agFloatingLabel',
			compile : compile
		};

		function compile(element, attrs) {
			element.toggleClass('ag-hints', true);
			return {
				post : function postLink(scope, element, attrs, agFloatingLabel) {
					// BEGIN DUPLICATE CODE
					// Duplicate from ag-hints, and ng-messages take this out and make as options on the
					// container directive
					// Then compile the children if they are changed
					// Automatically center the ng-messaged when there is a
					var DEFAULTS = {
						autoPosition : true
					};
					var options = scope.$eval(attrs.options) || {};
					addDefaultsToObject(options , DEFAULTS);

					scope.compileAutoPosition = function() {
						console.log("--> compileAutoPosition | MESSAGES | do not run twice in succession");
						element.attr('ag-messages-auto-position', options.autoPosition);
						$compile(element)(scope);
					};

					// When re-compiling, the listener will be created twice, unless we perform this check.
					if(!scope.listener) {
						watchOptionsChanges();
					}

					if(options.autoPosition && !attrs.agMessagesAutoPosition){
						scope.compileAutoPosition();
					}

					function watchOptionsChanges() {
						scope.listener = scope.$watch(function(){
							return scope.$eval(attrs.options)
						}, function(newValue, oldValue) {
							options = newValue;
							if(angular.equals(newValue, oldValue))
								return; // skip
							if(newValue.autoPosition != oldValue.autoPosition) {
								scope.compileAutoPosition();
							}
						}, true);
					}
					// END DUPLICATE CODE
				}
			}
		}
	}
	angular.module('components')
		.directive('agHints', ['$compile', '$timeout', agHintsDirective])
})(window.angular);


(function (angular) {
	var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'];

	function agHintDirective() {
		return {
			restrict: 'EA',
			link: postLink,
			require: '^^?agFloatingLabel'
		};

		function postLink(scope, element, attrs, agFloatingLabel) {
			// If we are not a child of an input container, don't do anything
			if (!agFloatingLabel) return;
			element.toggleClass('ag-hint', true);
		}

		function hasVisibiltyDirective(attrs) {
			return visibilityDirectives.some(function (attr) {
				return attrs[attr];
			});
		}
	}
	angular.module('components')
		.directive('agHint', agHintDirective)
})(window.angular);
(function (angular) {
	var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'];

	function agInputGroupDirective() {
		return {
			restrict: 'EAC',
			link: postLink,
			// This is optional because we don't want target *all* ngMessage instances, just those inside of
			// mdInputContainer.
			require: '^^?agFloatingLabel'
		};

		function postLink(scope, element, attrs, agFloatingLabel) {
			// If we are not a child of an input container, don't do anything
			if (!agFloatingLabel) return;
			element.toggleClass('ag-input-group', true);
			agFloatingLabel.setHasLabel(true);
			scope.$on('$destroy', function(){
				agFloatingLabel.setHasLabel(false);
			})
		}

		function hasVisibiltyDirective(attrs) {
			return visibilityDirectives.some(function (attr) {
				return attrs[attr];
			});
		}
	}
	angular.module('components')
		.directive('agInputGroup', agInputGroupDirective)
})(window.angular);

(function (angular) {
	function agInputInvalidMessagesAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				console.log("AddClass");
				var messages = getMessagesElement(element);

				if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
					showInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			,
			removeClass : function(element, className, done) {
				console.log("RemoveClass");
				var messages = getMessagesElement(element);
				if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
					hideInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}

			// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function agHintsActiveAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				console.log("HINTS AddClass");
				var messages = getHintsElement(element);

				if (className == "ag-hints-active" /*&& messages.hasClass('ag-auto-hide')*/) {
					showHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			,
			removeClass : function(element, className, done) {
				console.log("HINTS RemoveClass");
				//var messages = getMessagesElement(element);
				if (className == "ag-hints-active" /*&& messages.hasClass('ag-auto-hide')*/) {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}

			// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function ngMessagesAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
				console.log("NgMessagesAnimation.enter()");
				showInputMessages(element, $animateCss, $q).finally(done);
			},

			leave: function(element, done) {
				console.log("NgMessagesAnimation.leave()");
				hideInputMessages(element, $animateCss, $q).finally(done);
			},

			addClass: function(element, className, done) {
				console.log("NgMessagesAnimation.addClass()");
				if (className == "ng-hide") {
					hideInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			},

			removeClass: function(element, className, done) {
				console.log("NgMessagesAnimation.removeClass()");
				if (className == "ng-hide") {
					showInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
		}
	}
	ngMessagesAnimation.$inject = ["$q", "$animateCss"];

	function ngMessageAnimation($animateCss) {
		return {
			enter: function(element, done) {
				var messages = getMessagesElement(element);
				// If we have the md-auto-hide class, the md-input-invalid animation will fire, so we can skip
				if (messages.hasClass('ag-auto-hide')) {
					done();
					return;
				}

				return showMessage(element, $animateCss);
			},

			leave: function(element, done) {
				return hideMessage(element, $animateCss);
			}
		}
	}
	ngMessageAnimation.$inject = ["$animateCss"];


	function agHintsAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
				console.log("agHintsAnimation.enter()");
				showHintMessages(element, $animateCss, $q).finally(done);
			},

			leave: function(element, done) {
				console.log("agHintsAnimation.leave()");
				hideHintMessages(element, $animateCss, $q).finally(done);
			},

			addClass: function(element, className, done) {
				console.log("agHintsAnimation.addClass()");
				if (className == "ng-hide") {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			},

			removeClass: function(element, className, done) {
				console.log("agHintsAnimation.removeClass()");
				if (className == "ng-hide") {
					showHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
		}
	}
	ngMessagesAnimation.$inject = ["$q", "$animateCss"];

	function agHintAnimation($animateCss) {
		return {
			enter: function(element, done) {
				var messages = getMessagesElement(element);
				// If we have the md-auto-hide class, the md-input-invalid animation will fire, so we can skip
				if (messages.hasClass('ag-auto-hide')) {
					done();
					return;
				}

				return showMessage(element, $animateCss);
			},

			leave: function(element, done) {
				return hideMessage(element, $animateCss);
			}
		}
	}
	ngMessageAnimation.$inject = ["$animateCss"];

	function showInputMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getMessagesElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = showMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	function hideInputMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getMessagesElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = hideMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}


	function showMessage(element, $animateCss) {
		var height = element[0].offsetHeight;
		return $animateCss(element, {
			event: 'enter',
			structural: true,
			from: {"opacity": 0, "margin-top": -height + "px"},
			to: {"opacity": 1, "margin-top": "0"},
			duration: .3
		});
	}

	function hideMessage(element, $animateCss) {
		var height = element[0].offsetHeight;
		var styles = window.getComputedStyle(element[0]);

		// If we are already hidden, just return an empty animation
		if (styles.opacity == 0) {
			return $animateCss(element, {});
		}

		// Otherwise, animate
		return $animateCss(element, {
			event: 'leave',
			structural: true,
			from: {"opacity": 1, "margin-top": 0},
			to: {"opacity": 0, "margin-top": -height + "px"},
			duration: .3
		});
	}

	function getInputElement(element) {
		var inputContainer = element.controller('agFloatingLabel');
		return inputContainer.element;
	}

	function getMessagesElement(element) {
		var input = getInputElement(element);
		var selector = 'ng-messages,data-ng-messages,x-ng-messages,' +
			'[ng-messages],[data-ng-messages],[x-ng-messages]';

		return angular.element(input[0].querySelector(selector));
	}
	function getHintsElement(element) {
		var input = getInputElement(element);
		var selector = 'ag-hints';

		return angular.element(input[0].querySelector(selector));
	}


	function showHintMessages(element, $animateCss, $q) {
		console.log("showHintMessages()");
		var animators = [], animator;
		var messages = getHintsElement(element);

		console.log("getHintsElement returned:", messages);

		angular.forEach(messages.children(), function(child) {
			console.log("ShowMessage for child:", child);
			animator = showMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	function hideHintMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getHintsElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = hideMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	angular
		.module('components')
		.animation('.ag-input-invalid', agInputInvalidMessagesAnimation)
		.animation('.ag-hints-active', agHintsActiveAnimation)
		.animation('.ag-input-messages-animation', ngMessagesAnimation)
		.animation('.ag-input-message-animation', ngMessageAnimation)
		.animation('.ag-input-hints-animation', agHintsAnimation);
})(window.angular);
(function (angular) {
	function agMessagesAutoPosition() {
		return {
			restrict: 'EA',
			link: postLink,
			// This is optional because we don't want target *all* ngMessage instances, just those inside of
			// mdInputContainer.
			require: '^^?agFloatingLabel'
		};

		function postLink(scope, element, attrs, agFloatingLabel) {
			if (!agFloatingLabel) return;
			scope.$watch(function(){
				return scope.$eval(attrs.agMessagesAutoPosition)
			}, function(newValue, oldValue){
				console.log('____agMessagedAutoPosition changing from : ', oldValue + ' to: ', newValue);
				if(newValue)
					center();
				else
					undoCenter();
			});

			var paddingLeftOld;
			function undoCenter() {
				element.css('padding-left', '0px' );
			}
			function center() {
				console.log("DoCenter");
				element.toggleClass('ag-messages-auto-position', true);
				var inputElement = agFloatingLabel.element[0].querySelector('input, select'),
					inputOffset = getElementOffset(inputElement),
					agFloatingLabelOffset = getElementOffset(agFloatingLabel.element[0]),
					offsetLeftDifference = inputOffset.left - agFloatingLabelOffset.left,
					offsetLeftStyle = offsetLeftDifference + 'px'
					;
				element.css('padding-left', offsetLeftStyle);
			}
		}
	}

	angular.module('components')
		.directive('agMessagesAutoPosition', agMessagesAutoPosition)
})(window.angular);

function getElementOffset(element)
{
	var de = document.documentElement;
	var box = element.getBoundingClientRect();
	var top = box.top + window.pageYOffset - de.clientTop;
	var left = box.left + window.pageXOffset - de.clientLeft;
	return { top: top, left: left };
}


angular
	.module('components')
	.factory('$agUtil', UtilFactory);

/**
 * ngInject
 */
function UtilFactory($document, $timeout, $compile, $rootScope, $interpolate, $log, $rootElement, $window) {
	// Setup some core variables for the processTemplate method
	var startSymbol = $interpolate.startSymbol(),
		endSymbol = $interpolate.endSymbol(),
		usesStandardSymbols = ((startSymbol === '{{') && (endSymbol === '}}'));

	/**
	 * Checks if the target element has the requested style by key
	 * @param {DOMElement|JQLite} target Target element
	 * @param {string} key Style key
	 * @param {string=} expectedVal Optional expected value
	 * @returns {boolean} Whether the target element has the style or not
	 */
	var hasComputedStyle = function (target, key, expectedVal) {
		var hasValue = false;

		if ( target && target.length  ) {
			var computedStyles = $window.getComputedStyle(target[0]);
			hasValue = angular.isDefined(computedStyles[key]) && (expectedVal ? computedStyles[key] == expectedVal : true);
		}

		return hasValue;
	};

	var $agUtil = {
		dom: {},
		now: window.performance ?
			angular.bind(window.performance, window.performance.now) : Date.now || function() {
			return new Date().getTime();
		},

		clientRect: function(element, offsetParent, isOffsetRect) {
			var node = getNode(element);
			offsetParent = getNode(offsetParent || node.offsetParent || document.body);
			var nodeRect = node.getBoundingClientRect();

			// The user can ask for an offsetRect: a rect relative to the offsetParent,
			// or a clientRect: a rect relative to the page
			var offsetRect = isOffsetRect ?
				offsetParent.getBoundingClientRect() :
			{left: 0, top: 0, width: 0, height: 0};
			return {
				left: nodeRect.left - offsetRect.left,
				top: nodeRect.top - offsetRect.top,
				width: nodeRect.width,
				height: nodeRect.height
			};
		},
		offsetRect: function(element, offsetParent) {
			return $agUtil.clientRect(element, offsetParent, true);
		},

		// Annoying method to copy nodes to an array, thanks to IE
		nodesToArray: function(nodes) {
			nodes = nodes || [];

			var results = [];
			for (var i = 0; i < nodes.length; ++i) {
				results.push(nodes.item(i));
			}
			return results;
		},

		/**
		 * Calculate the positive scroll offset
		 * TODO: Check with pinch-zoom in IE/Chrome;
		 *       https://code.google.com/p/chromium/issues/detail?id=496285
		 */
		scrollTop: function(element) {
			element = angular.element(element || $document[0].body);

			var body = (element[0] == $document[0].body) ? $document[0].body : undefined;
			var scrollTop = body ? body.scrollTop + body.parentElement.scrollTop : 0;

			// Calculate the positive scroll offset
			return scrollTop || Math.abs(element[0].getBoundingClientRect().top);
		},

		/**
		 * Finds the proper focus target by searching the DOM.
		 *
		 * @param containerEl
		 * @param attributeVal
		 * @returns {*}
		 */
		findFocusTarget: function(containerEl, attributeVal) {
			var AUTO_FOCUS = '[md-autofocus]';
			var elToFocus;

			elToFocus = scanForFocusable(containerEl, attributeVal || AUTO_FOCUS);

			if ( !elToFocus && attributeVal != AUTO_FOCUS) {
				// Scan for deprecated attribute
				elToFocus = scanForFocusable(containerEl, '[md-auto-focus]');

				if ( !elToFocus ) {
					// Scan for fallback to 'universal' API
					elToFocus = scanForFocusable(containerEl, AUTO_FOCUS);
				}
			}

			return elToFocus;

			/**
			 * Can target and nested children for specified Selector (attribute)
			 * whose value may be an expression that evaluates to True/False.
			 */
			function scanForFocusable(target, selector) {
				var elFound, items = target[0].querySelectorAll(selector);

				// Find the last child element with the focus attribute
				if ( items && items.length ){
					items.length && angular.forEach(items, function(it) {
						it = angular.element(it);

						// Check the element for the md-autofocus class to ensure any associated expression
						// evaluated to true.
						var isFocusable = it.hasClass('md-autofocus');
						if (isFocusable) elFound = it;
					});
				}
				return elFound;
			}
		},

		// Disables scroll around the passed element.
		disableScrollAround: function(element, parent) {
			$agUtil.disableScrollAround._count = $agUtil.disableScrollAround._count || 0;
			++$agUtil.disableScrollAround._count;
			if ($agUtil.disableScrollAround._enableScrolling) return $agUtil.disableScrollAround._enableScrolling;
			element = angular.element(element);
			var body = $document[0].body,
				restoreBody = disableBodyScroll(),
				restoreElement = disableElementScroll(parent);

			return $agUtil.disableScrollAround._enableScrolling = function() {
				if (!--$agUtil.disableScrollAround._count) {
					restoreBody();
					restoreElement();
					delete $agUtil.disableScrollAround._enableScrolling;
				}
			};

			// Creates a virtual scrolling mask to absorb touchmove, keyboard, scrollbar clicking, and wheel events
			function disableElementScroll(element) {
				element = angular.element(element || body)[0];
				var zIndex = 50;
				var scrollMask = angular.element(
					'<div class="md-scroll-mask">' +
					'  <div class="md-scroll-mask-bar"></div>' +
					'</div>').css('z-index', zIndex);
				element.appendChild(scrollMask[0]);

				scrollMask.on('wheel', preventDefault);
				scrollMask.on('touchmove', preventDefault);

				return function restoreScroll() {
					scrollMask.off('wheel');
					scrollMask.off('touchmove');
					scrollMask[0].parentNode.removeChild(scrollMask[0]);
					delete $agUtil.disableScrollAround._enableScrolling;
				};

				function preventDefault(e) {
					e.preventDefault();
				}
			}

			// Converts the body to a position fixed block and translate it to the proper scroll
			// position
			function disableBodyScroll() {
				var htmlNode = body.parentNode;
				var restoreHtmlStyle = htmlNode.style.cssText || '';
				var restoreBodyStyle = body.style.cssText || '';
				var scrollOffset = $agUtil.scrollTop(body);
				var clientWidth = body.clientWidth;

				if (body.scrollHeight > body.clientHeight + 1) {
					applyStyles(body, {
						position: 'fixed',
						width: '100%',
						top: -scrollOffset + 'px'
					});

					applyStyles(htmlNode, {
						overflowY: 'scroll'
					});
				}

				if (body.clientWidth < clientWidth) applyStyles(body, {overflow: 'hidden'});

				return function restoreScroll() {
					body.style.cssText = restoreBodyStyle;
					htmlNode.style.cssText = restoreHtmlStyle;
					body.scrollTop = scrollOffset;
					htmlNode.scrollTop = scrollOffset;
				};
			}

			function applyStyles(el, styles) {
				for (var key in styles) {
					el.style[key] = styles[key];
				}
			}
		},
		enableScrolling: function() {
			var method = this.disableScrollAround._enableScrolling;
			method && method();
		},
		floatingScrollbars: function() {
			if (this.floatingScrollbars.cached === undefined) {
				var tempNode = angular.element('<div><div></div></div>').css({
					width: '100%',
					'z-index': -1,
					position: 'absolute',
					height: '35px',
					'overflow-y': 'scroll'
				});
				tempNode.children().css('height', '60px');

				$document[0].body.appendChild(tempNode[0]);
				this.floatingScrollbars.cached = (tempNode[0].offsetWidth == tempNode[0].childNodes[0].offsetWidth);
				tempNode.remove();
			}
			return this.floatingScrollbars.cached;
		},

		// Mobile safari only allows you to set focus in click event listeners...
		forceFocus: function(element) {
			var node = element[0] || element;

			document.addEventListener('click', function focusOnClick(ev) {
				if (ev.target === node && ev.$focus) {
					node.focus();
					ev.stopImmediatePropagation();
					ev.preventDefault();
					node.removeEventListener('click', focusOnClick);
				}
			}, true);

			var newEvent = document.createEvent('MouseEvents');
			newEvent.initMouseEvent('click', false, true, window, {}, 0, 0, 0, 0,
				false, false, false, false, 0, null);
			newEvent.$material = true;
			newEvent.$focus = true;
			node.dispatchEvent(newEvent);
		},

		/**
		 * facade to build md-backdrop element with desired styles
		 * NOTE: Use $compile to trigger backdrop postLink function
		 */
		createBackdrop: function(scope, addClass) {
			return $compile($agUtil.supplant('<md-backdrop class="{0}">', [addClass]))(scope);
		},

		/**
		 * supplant() method from Crockford's `Remedial Javascript`
		 * Equivalent to use of $interpolate; without dependency on
		 * interpolation symbols and scope. Note: the '{<token>}' can
		 * be property names, property chains, or array indices.
		 */
		supplant: function(template, values, pattern) {
			pattern = pattern || /\{([^\{\}]*)\}/g;
			return template.replace(pattern, function(a, b) {
				var p = b.split('.'),
					r = values;
				try {
					for (var s in p) {
						if (p.hasOwnProperty(s) ) {
							r = r[p[s]];
						}
					}
				} catch (e) {
					r = a;
				}
				return (typeof r === 'string' || typeof r === 'number') ? r : a;
			});
		},

		fakeNgModel: function() {
			return {
				$fake: true,
				$setTouched: angular.noop,
				$setViewValue: function(value) {
					this.$viewValue = value;
					this.$render(value);
					this.$viewChangeListeners.forEach(function(cb) {
						cb();
					});
				},
				$isEmpty: function(value) {
					return ('' + value).length === 0;
				},
				$parsers: [],
				$formatters: [],
				$viewChangeListeners: [],
				$render: angular.noop
			};
		},

		// Returns a function, that, as long as it continues to be invoked, will not
		// be triggered. The function will be called after it stops being called for
		// N milliseconds.
		// @param wait Integer value of msecs to delay (since last debounce reset); default value 10 msecs
		// @param invokeApply should the $timeout trigger $digest() dirty checking
		debounce: function(func, wait, scope, invokeApply) {
			var timer;

			return function debounced() {
				var context = scope,
					args = Array.prototype.slice.call(arguments);

				$timeout.cancel(timer);
				timer = $timeout(function() {

					timer = undefined;
					func.apply(context, args);

				}, wait || 10, invokeApply);
			};
		},

		// Returns a function that can only be triggered every `delay` milliseconds.
		// In other words, the function will not be called unless it has been more
		// than `delay` milliseconds since the last call.
		throttle: function throttle(func, delay) {
			var recent;
			return function throttled() {
				var context = this;
				var args = arguments;
				var now = $agUtil.now();

				if (!recent || (now - recent > delay)) {
					func.apply(context, args);
					recent = now;
				}
			};
		},

		/**
		 * Measures the number of milliseconds taken to run the provided callback
		 * function. Uses a high-precision timer if available.
		 */
		time: function time(cb) {
			var start = $agUtil.now();
			cb();
			return $agUtil.now() - start;
		},

		/**
		 * Create an implicit getter that caches its `getter()`
		 * lookup value
		 */
		valueOnUse : function (scope, key, getter) {
			var value = null, args = Array.prototype.slice.call(arguments);
			var params = (args.length > 3) ? args.slice(3) : [ ];

			Object.defineProperty(scope, key, {
				get: function () {
					if (value === null) value = getter.apply(scope, params);
					return value;
				}
			});
		},

		/**
		 * Get a unique ID.
		 *
		 * @returns {string} an unique numeric string
		 */
		nextUid: function() {
			return '' + nextUniqueId++;
		},

		// Stop watchers and events from firing on a scope without destroying it,
		// by disconnecting it from its parent and its siblings' linked lists.
		disconnectScope: function disconnectScope(scope) {
			if (!scope) return;

			// we can't destroy the root scope or a scope that has been already destroyed
			if (scope.$root === scope) return;
			if (scope.$$destroyed) return;

			var parent = scope.$parent;
			scope.$$disconnected = true;

			// See Scope.$destroy
			if (parent.$$childHead === scope) parent.$$childHead = scope.$$nextSibling;
			if (parent.$$childTail === scope) parent.$$childTail = scope.$$prevSibling;
			if (scope.$$prevSibling) scope.$$prevSibling.$$nextSibling = scope.$$nextSibling;
			if (scope.$$nextSibling) scope.$$nextSibling.$$prevSibling = scope.$$prevSibling;

			scope.$$nextSibling = scope.$$prevSibling = null;

		},

		// Undo the effects of disconnectScope above.
		reconnectScope: function reconnectScope(scope) {
			if (!scope) return;

			// we can't disconnect the root node or scope already disconnected
			if (scope.$root === scope) return;
			if (!scope.$$disconnected) return;

			var child = scope;

			var parent = child.$parent;
			child.$$disconnected = false;
			// See Scope.$new for this logic...
			child.$$prevSibling = parent.$$childTail;
			if (parent.$$childHead) {
				parent.$$childTail.$$nextSibling = child;
				parent.$$childTail = child;
			} else {
				parent.$$childHead = parent.$$childTail = child;
			}
		},

		/*
		 * getClosest replicates jQuery.closest() to walk up the DOM tree until it finds a matching nodeName
		 *
		 * @param el Element to start walking the DOM from
		 * @param tagName Tag name to find closest to el, such as 'form'
		 * @param onlyParent Only start checking from the parent element, not `el`.
		 */
		getClosest: function getClosest(el, tagName, onlyParent) {
			if (el instanceof angular.element) el = el[0];
			tagName = tagName.toUpperCase();
			if (onlyParent) el = el.parentNode;
			if (!el) return null;
			do { 
				if (el.nodeName === tagName) {
					return el;
				}
			} while (el = el.parentNode);
			return null;
		},

		/**
		 * Build polyfill for the Node.contains feature (if needed)
		 */
		elementContains: function(node, child) {
			var hasContains = (window.Node && window.Node.prototype && Node.prototype.contains);
			var findFn = hasContains ? angular.bind(node, node.contains) : angular.bind(node, function(arg) {
				// compares the positions of two nodes and returns a bitmask
				return (node === child) || !!(this.compareDocumentPosition(arg) & 16)
			});

			return findFn(child);
		},

		/**
		 * Functional equivalent for $element.filter(‘md-bottom-sheet’)
		 * useful with interimElements where the element and its container are important...
		 *
		 * @param {[]} elements to scan
		 * @param {string} name of node to find (e.g. 'md-dialog')
		 * @param {boolean=} optional flag to allow deep scans; defaults to 'false'.
		 * @param {boolean=} optional flag to enable log warnings; defaults to false
		 */
		extractElementByName: function(element, nodeName, scanDeep, warnNotFound) {
			var found = scanTree(element);
			if (!found && !!warnNotFound) {
				$log.warn( $agUtil.supplant("Unable to find node '{0}' in element '{1}'.",[nodeName, element[0].outerHTML]) );
			}

			return angular.element(found || element);

			/**
			 * Breadth-First tree scan for element with matching `nodeName`
			 */
			function scanTree(element) {
				return scanLevel(element) || (!!scanDeep ? scanChildren(element) : null);
			}

			/**
			 * Case-insensitive scan of current elements only (do not descend).
			 */
			function scanLevel(element) {
				if ( element ) {
					for (var i = 0, len = element.length; i < len; i++) {
						if (element[i].nodeName.toLowerCase() === nodeName) {
							return element[i];
						}
					}
				}
				return null;
			}

			/**
			 * Scan children of specified node
			 */
			function scanChildren(element) {
				var found;
				if ( element ) {
					for (var i = 0, len = element.length; i < len; i++) {
						var target = element[i];
						if ( !found ) {
							for (var j = 0, numChild = target.childNodes.length; j < numChild; j++) {
								found = found || scanTree([target.childNodes[j]]);
							}
						}
					}
				}
				return found;
			}

		},

		/**
		 * Give optional properties with no value a boolean true if attr provided or false otherwise
		 */
		initOptionalProperties: function(scope, attr, defaults) {
			defaults = defaults || {};
			angular.forEach(scope.$$isolateBindings, function(binding, key) {
				if (binding.optional && angular.isUndefined(scope[key])) {
					var attrIsDefined = angular.isDefined(attr[binding.attrName]);
					scope[key] = angular.isDefined(defaults[key]) ? defaults[key] : attrIsDefined;
				}
			});
		},

		/**
		 * Alternative to $timeout calls with 0 delay.
		 * nextTick() coalesces all calls within a single frame
		 * to minimize $digest thrashing
		 *
		 * @param callback
		 * @param digest
		 * @returns {*}
		 */
		nextTick: function(callback, digest, scope) {
			//-- grab function reference for storing state details
			var nextTick = $agUtil.nextTick;
			var timeout = nextTick.timeout;
			var queue = nextTick.queue || [];

			//-- add callback to the queue
			queue.push(callback);

			//-- set default value for digest
			if (digest == null) digest = true;

			//-- store updated digest/queue values
			nextTick.digest = nextTick.digest || digest;
			nextTick.queue = queue;

			//-- either return existing timeout or create a new one
			return timeout || (nextTick.timeout = $timeout(processQueue, 0, false));

			/**
			 * Grab a copy of the current queue
			 * Clear the queue for future use
			 * Process the existing queue
			 * Trigger digest if necessary
			 */
			function processQueue() {
				var skip = scope && scope.$$destroyed;
				var queue = !skip ? nextTick.queue : [];
				var digest = !skip ? nextTick.digest : null;

				nextTick.queue = [];
				nextTick.timeout = null;
				nextTick.digest = false;

				queue.forEach(function(callback) {
					callback();
				});

				if (digest) $rootScope.$digest();
			}
		},

		/**
		 * Processes a template and replaces the start/end symbols if the application has
		 * overriden them.
		 *
		 * @param template The template to process whose start/end tags may be replaced.
		 * @returns {*}
		 */
		processTemplate: function(template) {
			if (usesStandardSymbols) {
				return template;
			} else {
				if (!template || !angular.isString(template)) return template;
				return template.replace(/\{\{/g, startSymbol).replace(/}}/g, endSymbol);
			}
		},

		/**
		 * Scan up dom hierarchy for enabled parent;
		 */
		getParentWithPointerEvents: function (element) {
			var parent = element.parent();

			// jqLite might return a non-null, but still empty, parent; so check for parent and length
			while (hasComputedStyle(parent, 'pointer-events', 'none')) {
				parent = parent.parent();
			}

			return parent;
		},

		getNearestContentElement: function (element) {
			var current = element.parent()[0];
			// Look for the nearest parent md-content, stopping at the rootElement.
			while (current && current !== $rootElement[0] && current !== document.body && current.nodeName.toUpperCase() !== 'MD-CONTENT') {
				current = current.parentNode;
			}
			return current;
		},

		/**
		 * Parses an attribute value, mostly a string.
		 * By default checks for negated values and returns `false´ if present.
		 * Negated values are: (native falsy) and negative strings like:
		 * `false` or `0`.
		 * @param value Attribute value which should be parsed.
		 * @param negatedCheck When set to false, won't check for negated values.
		 * @returns {boolean}
		 */
		parseAttributeBoolean: function(value, negatedCheck) {
			return value === '' || !!value && (negatedCheck === false || value !== 'false' && value !== '0');
		},

		hasComputedStyle: hasComputedStyle
	};


	return $agUtil;

	function getNode(el) {
		return el[0] || el;
	}

}
UtilFactory.$inject = ["$document", "$timeout", "$compile", "$rootScope", "$interpolate", "$log", "$rootElement", "$window"];
//
//
// A "Floating Label" directive using the placeholder attribute
// Based on https://github.com/jverdi/JVFloatLabeledTextField and https://github.com/maman/JVFloat.js
//
// By @klaascuvelier (http://www.klaascuvelier.be)
//
//
(function (angular) {
	'use strict';

	/**
	 * generate an NgModel key for the input box using it's attributes (id/name)
	 * @param {angular.element} inputBox
	 * @return {string}
	 */
	function generateNgModelKey(inputBox) {
		var inputId = inputBox.attr('id') || '',
			inputName = inputBox.attr('name') || '';

		if (inputId.length === 0 && inputName.length === 0) {
			throw 'If no ng-model is defined, the input should have an id or a name';
		}

		return 'input_' + (inputId ? inputId : inputName);
	}

	/**
	 * Post compile method
	 * @param $scope
	 * @param $element
	 */
	function floatingLabelPostCompileFunction ($scope, $element, $attrs)
	{
		var inputBox = $element.find('input'),
			ngModelKey = inputBox.attr('ng-model'),
			placeholderBackup = inputBox.attr('placeholder');

		$scope.showLabel = false;
		$scope.focus = false;
		$scope.label =

			$scope.$watch($scope.focus, function(value){
				console.log(value);
				//alert(value);
			});
		$scope.setFocus = function(bool) {
			$scope.focus = bool;
		};

		$scope.$watch('focus', function(value){
			if(value){
				placeholderBackup = inputBox.attr('placeholder');
				inputBox.attr('placeholder', '');// = '';
				$scope.showLabel = true;
			}
			else {
				$scope.showLabel = false;
				inputBox.attr('placeholder', placeholderBackup);
			}
		})
		$scope.$watch(ngModelKey, function (newValue) {
			// if the field is not empty, show the label, otherwise hide it
			$scope.showLabel = typeof newValue === 'string' && newValue.length > 0;
		});
	}

	function getElementOffset(element)
	{
		var de = document.documentElement;
		var box = element.getBoundingClientRect();
		var top = box.top + window.pageYOffset - de.clientTop;
		var left = box.left + window.pageXOffset - de.clientLeft;
		return { top: top, left: left };
	}

	function floatingLabelCompileFunction ($element, $attrs)
	{
		var templateAttributes = [
				'ng-focus="setFocus(true)"',
				'ng-blur="setFocus(false)"'
			],
			template, attr;

		// if there is no placeholder, there is no use for this directive
		if (!$attrs.placeholder) {
			//throw 'Floating label needs a placeholder';
		}
		if($attrs.placeholder) {
			// templateAttributes.push('placeholder="{{placeholderModel}}"');
		}

		// copy existing attributes from
		for (attr in $attrs) {
			if ($attrs.hasOwnProperty(attr) && attr.substr(0, 1) !== '$' && attr !== 'floatingLabel') {
				templateAttributes.push($attrs.$attr[attr] + '="' + $attrs[attr] + '"');
			}
		}


		return {
			post: floatingLabelPostCompileFunction
		};
	}

	// Add DI
	floatingLabelCompileFunction.$inject = ['$element', '$attrs'];


	// Add DI
	floatingLabelPostCompileFunction.$inject = ['$scope', '$element', '$attrs'];


	function ContainerCtrl($scope, $element, $attrs, $animate) {
		var self = this;
		self.element = $element,
			self.invalid = false,
			self.hintsActive = false,
			self.focused = false,
			self.hasLabel = false
		;

		self.isErrorGetter = $attrs.agIsError && $parse($attrs.agIsError);

		$element.addClass('ag-floating-label');

		self.setHasValue = function(hasValue) {
			$element.toggleClass('ag-input-has-value', !!hasValue);
		};
		self.setHasPlaceholder = function(hasPlaceholder) {
			$element.toggleClass('ag-input-has-placeholder', !!hasPlaceholder);
		};
		self.setFocused = function(isFocused) {
			self.focused = isFocused;
			$element.toggleClass('ag-input-focused', !!isFocused);
			if(isFocused) {
				console.log("isFocused");
				self.setHints(true);
			}
			else {
				console.log("isNOTFocused");
				self.setHints(false);
			}
			//self.setHints(isFocused && !self.invalid);
		};
		self.setInvalid = function(isInvalid) {
			self.invalid = isInvalid;
			if (isInvalid) {
				$animate.addClass($element, 'ag-input-invalid');
				self.setHints(false);
			} else {
				self.setHints(self.focused || self.hintsActive);
				$animate.removeClass($element, 'ag-input-invalid');
			}
		};
		self.setHints = function(isActive) {
			self.hintsActive = isActive;
			$element.toggleClass('ag-input-has-hints', !!isActive);
			if (isActive && !self.invalid) {
				console.log("setting HINTS ACTIVE");
				$animate.addClass($element, 'ag-hints-active');
			} else {
				console.log("setting HINTS INACTIVE");
				$animate.removeClass($element, 'ag-hints-active');
			}
		};
		self.setHasLabel = function(hasLabel) {
			self.hasLabel = hasLabel;
			$element.toggleClass('ag-input-has-label', !!hasLabel);
		};

		// Useful for error setting display:none when nothing has been touched
		self.setTouched = function(isTouched) {
			$element.toggleClass('ag-input-touched', !!isTouched);
		};

		console.log("OFFSET:", getElementOffset($element[0]));
		self.offsetLeft = getElementOffset(self.element[0]);
		//alert(self.element.offsetLeft);
	}

	function postLink(scope, element, attr) {
		if (element.find('ag-icon').length) element.addClass('ag-has-icon');
	}
	/**
	 * Return the definition for this directive
	 * @returns {Object}
	 */
	function floatingLabelDefinition() {
		return {
			restrict: 'A',
			scope: true,
			link: postLink,
			// compile: floatingLabelCompileFunction,
			controller: ContainerCtrl
		};
	}

	// Create
	angular
		.module('components')
		.directive('agFloatingLabel', floatingLabelDefinition);
})(window.angular);
(function (angular) {

	function inputDirective($agUtil) {
		return {
			restrict : 'E',
			require: ['^?agFloatingLabel', '?ngModel'],
			link : postLink
		}
		function wrapInput(scope, element) {
			var wrapper = angular.element('<div class="ag-floating-label-input-wrapper"></div>');
			wrapper.append(angular.element('<div class="ag-floating-label-underline"></div>'));

			element.after(wrapper);
			wrapper.prepend(element);

			scope.inputWrapper = wrapper;

			scope.$on("$destroy", function() {
				wrapper.after(element);
				wrapper.remove();
			});
		}

		function postLink(scope, element, attr, ctrls){
			var containerCtrl = ctrls[0];
			var hasNgModel = !!ctrls[1];
			var ngModelCtrl = ctrls[1];
			var isReadonly = angular.isDefined(attr.readonly);
			if (!containerCtrl) return;
			if (containerCtrl.input) {
				throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			}

			// var isErrorGetter = containerCtrl.isErrorGetter || function() {
			// 		console.log("Returning ", ngModelCtrl.$invalid + " && " + ngModelCtrl.$touched);
			// 		return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
			// 	};
			var label = containerCtrl.element[0].querySelector('label');
			console.log("label is:", label);
			var isParentFormSubmitted = function () {
				var parent = false;//$mdUtil.getClosest(element, 'form');
				var form = parent ? angular.element(parent).controller('form') : null;

				return form ? form.$submitted : false;
			};

			var isErrorGetter = function() {
				// added ngModelCtrl.$dirty
				// $touched is only applied after exiting the input
				return containerCtrl.isErrorGetter 
					|| (ngModelCtrl.$invalid && (ngModelCtrl.$touched/* || ngModelCtrl.$dirty*/));
			}
			scope.$watch(function(){
				return ngModelCtrl.$touched
			}, function(value) {
				containerCtrl.setTouched(ngModelCtrl.$touched);
			})
			// scope.$watch(isErrorGetter, containerCtrl.setInvalid);
			scope.$watch(isErrorGetter, containerCtrl.setInvalid);
			
			wrapInput(scope, element);
			scope.inputWrapper.prepend(label);

			// Add an error spacer div after our input to provide space for the char counter and any ng-messages
			var errorsSpacer = angular.element('<div class="ag-errors-spacer">');
			var inputGroup = containerCtrl.element[0].querySelector('.ag-input-group, .input-group');
			if(inputGroup) {
				angular.element(inputGroup).after(errorsSpacer);
			}
			else {
				scope.inputWrapper.after(errorsSpacer);
			}

			ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
			ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

			function ngModelPipelineCheckValue(arg) {
				containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
				return arg;
			}

			containerCtrl.input = element;
			element.addClass('ag-input');
			element
				.on('focus', function(ev) {
					$agUtil.nextTick(function() {
						containerCtrl.setFocused(true);
					});
				})
				.on('blur', function(ev) {
					$agUtil.nextTick(function(){
						containerCtrl.setFocused(false);
						inputCheckValue();
					});
				});
			function inputCheckValue() {
				// An input's value counts if its length > 0,
				// or if the input's validity state says it has bad input (eg string in a number input)
				containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
			}
		}
	}
	angular.module('components')
		.directive('input', ['$agUtil', inputDirective])
})(window.angular);
(function (angular) {
	var visibilityDirectives = ['ngIf', 'ngShow', 'ngHide', 'ngSwitchWhen', 'ngSwitchDefault'];

	function addDefaultsToObject(object, defaults) {
		for(var prop in defaults) {
			if(!object.hasOwnProperty(prop)) {
				object[prop] = defaults[prop];
			}
		}
	}

	function ngMessagesDirective($compile) {
		return {
			restrict: 'EA',
			link: postLink,

			// This is optional because we don't want target *all* ngMessage instances, just those inside of
			// mdInputContainer.
			require: '^^?agFloatingLabel'
		};

		function postLink(scope, element, attrs, inputContainer) {
			// If we are not a child of an input container, don't do anything
			if (!inputContainer) return;
			
			// BEGIN DUPLICATE CODE
			// Duplicate from ag-hints, and ng-messages take this out and make as options on the container directive
			// Then compile the children if they are changed
			// Automatically center the ng-messaged when there is a 
			var DEFAULTS = {
				autoPosition : true
			};
			var options = scope.$eval(attrs.options) || {};
			addDefaultsToObject(options , DEFAULTS);

			scope.compileAutoPosition = function() {
				console.log("--> compileAutoPosition | MESSAGES | do not run twice in succession");
				element.attr('ag-messages-auto-position', options.autoPosition);
				$compile(element)(scope);
			};

			// When re-compiling, the listener will be created twice, unless we perform this check.
			if(!scope.listener) {
				watchOptionsChanges();
			}

			if(options.autoPosition && !attrs.agMessagesAutoPosition){
				scope.compileAutoPosition();
			}

			function watchOptionsChanges() {
				scope.listener = scope.$watch(function(){
					return scope.$eval(attrs.options)
				}, function(newValue, oldValue) {
					options = newValue;
					if(angular.equals(newValue, oldValue))
						return; // skip
					if(newValue.autoPosition != oldValue.autoPosition) {
						scope.compileAutoPosition();
					}
				}, true);
			}
			// END DUPLICATE CODE 
			
			// Add our animation class
			element.toggleClass('ag-input-messages-animation', true);
			

			// Add our md-auto-hide class to automatically hide/show messages when container is invalid
			element.toggleClass('ag-auto-hide', true);

			// If we see some known visibility directives, remove the md-auto-hide class
			if (attrs.agAutoHide == 'false' || hasVisibiltyDirective(attrs)) {
				element.toggleClass('ag-auto-hide', false);
			}
		}

		function hasVisibiltyDirective(attrs) {
			return visibilityDirectives.some(function (attr) {
				return attrs[attr];
			});
		}
	}
	angular.module('components')
		.directive('ngMessages', ['$compile', ngMessagesDirective])
})(window.angular);

(function (angular) {
	function ngMessageDirective($agUtil) {
		return {
			restrict: 'EA',
			compile: compile,
			priority: 100
		};

		function compile(element) {
			var inputContainer = $agUtil.getClosest(element, "ag-floating-label");

			// If we are not a child of an input container, don't do anything
			if (!inputContainer) return; 

			// Add our animation class
			element.toggleClass('ag-input-message-animation', true);

			return {};
		}
	}
	ngMessageDirective.$inject = ["$agUtil"];

	angular.module('components')
		.directive('ngMessage', ngMessageDirective)
})(window.angular);
(function (angular) {
	function placeholderDirective() {
		return {
			restrict: 'A',
			require: '^^?agFloatingLabel',
			priority: 200,
			link: postLink
		};

		function postLink(scope, element, attr, agFloatingLabel) {
			// If there is no input container, just return
			console.log("postLink");
			if (!agFloatingLabel) return;
			console.log("...postLink");

			var label = agFloatingLabel.element.find('label');
			var hasNoFloat = angular.isDefined(agFloatingLabel.element.attr('ag-no-float'));

			console.log("label:", label);
			// If we have a label, or they specify the md-no-float attribute, just return
			if ((label && label.length) || hasNoFloat) {
				// Add a placeholder class so we can target it in the CSS
				agFloatingLabel.setHasPlaceholder(true);
				return;
			}

			// Otherwise, grab/remove the placeholder
			var placeholderText = attr.placeholder;
			element.removeAttr('placeholder');

			// And add the placeholder text as a separate label
			if (agFloatingLabel.input && agFloatingLabel.input[0].nodeName != 'MD-SELECT') {
				var placeholder = '<label ng-click="delegateClick()">' + placeholderText + '</label>';

				agFloatingLabel.element.addClass('ag-icon-float');
				agFloatingLabel.element.prepend(placeholder);
			}
		}
	}
	angular.module('components')
		.directive('placeholder', placeholderDirective)
})(window.angular);
(function (angular) {

	function selectDirective($timeout) {
		return {
			restrict : 'E',
			require: ['^?agFloatingLabel', '?ngModel'],
			link : postLink
		}

		function wrapInput(scope, element) {
			var wrapper = angular.element('<div class="ag-floating-label-input-wrapper"></div>');
			wrapper.append(angular.element('<div class="ag-floating-label-underline"></div>'));

			element.after(wrapper);
			wrapper.prepend(element);

			scope.inputWrapper = wrapper;

			scope.$on("$destroy", function() {
				wrapper.after(element);
				wrapper.remove();
			});
		}

		function postLink(scope, element, attr, ctrls){
			var containerCtrl = ctrls[0];
			var hasNgModel = !!ctrls[1];
			var ngModelCtrl = ctrls[1];
			var isReadonly = angular.isDefined(attr.readonly);
			if (!containerCtrl) return;
			if(!ngModelCtrl) {
				console.warn('a select directive called without an ngModel');
				return;
			}
			if (containerCtrl.input) {
				throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			}

			// var isErrorGetter = containerCtrl.isErrorGetter || function() {
			// 		console.log("Returning ", ngModelCtrl.$invalid + " && " + ngModelCtrl.$touched);
			// 		return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
			// 	};

			var isParentFormSubmitted = function () {
				var parent = false;//$mdUtil.getClosest(element, 'form');
				var form = parent ? angular.element(parent).controller('form') : null;

				return form ? form.$submitted : false;
			};

			var isErrorGetter = function() {
				// added ngModelCtrl.$dirty
				// $touched is only applied after exiting the input
				return containerCtrl.isErrorGetter 
					|| (ngModelCtrl.$invalid && (ngModelCtrl.$touched/* || ngModelCtrl.$dirty*/));
			}
			scope.$watch(function(){
				return ngModelCtrl && ngModelCtrl.$touched
			}, function(value) {
				containerCtrl.setTouched(ngModelCtrl.$touched);
			})
			// scope.$watch(isErrorGetter, containerCtrl.setInvalid);
			scope.$watch(isErrorGetter, containerCtrl.setInvalid);

			// After selecting an input, we want to remove the highlighting
			// by default, the select box remains focused, so let's unfocus it.
			scope.$watch(function(){
				return ngModelCtrl.$viewValue
			}, function(value){
				if(value) {
					// blur it because the class is being set below.  We need to blur it as well
					element[0].blur();
					containerCtrl.setFocused(false);
					inputCheckValue();
				}
			})

			wrapInput(scope, element);

			var errorsSpacer = angular.element('<div class="ag-errors-spacer">');
			var inputGroup = containerCtrl.element[0].querySelector('.ag-input-group, .input-group');
			if(inputGroup) {
				angular.element(inputGroup).after(errorsSpacer);
			}
			else {
				scope.inputWrapper.after(errorsSpacer);
			}

			ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
			ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

			function ngModelPipelineCheckValue(arg) {
				containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
				return arg;
			}

			containerCtrl.input = element;
			element.addClass('ag-input');
			element
				.on('focus', function(ev) {
					$timeout(function() {
						containerCtrl.setFocused(true);
					});
				})
				.on('blur', function(ev) {
					$timeout(function() {
						containerCtrl.setFocused(false);
						inputCheckValue();
					});
				});
			function inputCheckValue() {
				// An input's value counts if its length > 0,
				// or if the input's validity state says it has bad input (eg string in a number input)
				console.log("element.val().length", element.val().length);
				console.log("element.val()", element.val());
				containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
			}
		}
	}
	angular.module('components')
		.directive('select', selectDirective)
})(window.angular);