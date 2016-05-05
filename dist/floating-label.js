(function(angular) {
    'use strict';
    var app = angular.module('agFloatingLabel', ['ngMessages', 'ngAnimate']);
	app.config(function($animateProvider){
		$animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/)
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
	angular.module('agFloatingLabel')
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
			if (!agFloatingLabel) return;
			element.toggleClass('ag-hint', true);
		}

		function hasVisibiltyDirective(attrs) {
			return visibilityDirectives.some(function (attr) {
				return attrs[attr];
			});
		}
	}

	angular.module('agFloatingLabel')
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
	angular.module('agFloatingLabel')
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
		.module('agFloatingLabel')
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
				console.log('____agMessagedAutoPosition changing from : ', oldValue + ' to: ', newValue, " and element: ", element);
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
				var inputElement = agFloatingLabel.element[0].querySelector('input, select, textarea'),
					inputOffset = getElementOffset(inputElement),
					agFloatingLabelOffset = getElementOffset(agFloatingLabel.element[0]),
					offsetLeftDifference = inputOffset.left - agFloatingLabelOffset.left,
					offsetLeftStyle = offsetLeftDifference + 'px'
					;
				element.css('padding-left', offsetLeftStyle);
			}
		}
	}

	angular.module('agFloatingLabel')
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

(function() {
	angular
		.module('agFloatingLabel')
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

			if (target && target.length) {
				var computedStyles = $window.getComputedStyle(target[0]);
				hasValue = angular.isDefined(computedStyles[key]) && (expectedVal ? computedStyles[key] == expectedVal : true);
			}

			return hasValue;
		};

		var $agUtil = {
			dom: {},
			now: window.performance ?
				angular.bind(window.performance, window.performance.now) : Date.now || function () {
				return new Date().getTime();
			},

			clientRect: function (element, offsetParent, isOffsetRect) {
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
			offsetRect: function (element, offsetParent) {
				return $agUtil.clientRect(element, offsetParent, true);
			},

			// Annoying method to copy nodes to an array, thanks to IE
			nodesToArray: function (nodes) {
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
			scrollTop: function (element) {
				element = angular.element(element || $document[0].body);

				var body = (element[0] == $document[0].body) ? $document[0].body : undefined;
				var scrollTop = body ? body.scrollTop + body.parentElement.scrollTop : 0;

				// Calculate the positive scroll offset
				return scrollTop || Math.abs(element[0].getBoundingClientRect().top);
			},

			floatingScrollbars: function () {
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

			fakeNgModel: function () {
				return {
					$fake: true,
					$setTouched: angular.noop,
					$setViewValue: function (value) {
						this.$viewValue = value;
						this.$render(value);
						this.$viewChangeListeners.forEach(function (cb) {
							cb();
						});
					},
					$isEmpty: function (value) {
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
			debounce: function (func, wait, scope, invokeApply) {
				var timer;

				return function debounced() {
					var context = scope,
						args = Array.prototype.slice.call(arguments);

					$timeout.cancel(timer);
					timer = $timeout(function () {

						timer = undefined;
						func.apply(context, args);

					}, wait || 10, invokeApply);
				};
			},
			/**
			 * Get a unique ID.
			 *
			 * @returns {string} an unique numeric string
			 */
			nextUid: function () {
				return '' + nextUniqueId++;
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
			elementContains: function (node, child) {
				var hasContains = (window.Node && window.Node.prototype && Node.prototype.contains);
				var findFn = hasContains ? angular.bind(node, node.contains) : angular.bind(node, function (arg) {
					// compares the positions of two nodes and returns a bitmask
					return (node === child) || !!(this.compareDocumentPosition(arg) & 16)
				});

				return findFn(child);
			},


			/**
			 * Give optional properties with no value a boolean true if attr provided or false otherwise
			 */
			initOptionalProperties: function (scope, attr, defaults) {
				defaults = defaults || {};
				angular.forEach(scope.$$isolateBindings, function (binding, key) {
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
			nextTick: function (callback, digest, scope) {
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

					queue.forEach(function (callback) {
						callback();
					});

					if (digest) $rootScope.$digest();
				}
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
			parseAttributeBoolean: function (value, negatedCheck) {
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
})(window.angular);
/*

 A Vanilla JS alternative for jQuery's wrapInner()
 innerwrap an HTML element with the option to add an attribute & value with it.
 Derived from:
 http://stackoverflow.com/questions/21817538/how-can-i-implement-jquerys-wrapinner-function-in-plain-javascript

 Usage
 ------
 Four parameters you can use:
 'parent'           = the element that needs to be innerwrapped
 'wrapper'          = the element that will innerwrap the parent
 'attribute'        = the attribute that you need this innerwrapped element to have
 'attributevalue'   = the value of the attribute you've just created

 Example
 -------
 wrapInner('body', 'div', 'class', 'my-class');

 */

var background = document.querySelector("#unique");
var bodyinner  = document.body;
var divtag     = document.querySelector("div");


//Check if the body element has an ID of #unique
// if (divtag.hasAttribute("id", "#unique")) {
// 	wrapInner(bodyinner, 'div', 'id', 'innerwrapped-element');
// }

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


	function getElementOffset(element)
	{
		var de = document.documentElement;
		var box = element.getBoundingClientRect();
		var top = box.top + window.pageYOffset - de.clientTop;
		var left = box.left + window.pageXOffset - de.clientLeft;
		return { top: top, left: left };
	}

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
			restrict: 'E',
			scope: true,
			link: postLink,
			transclude : true,
			// Wrap the content in an ag-floating-label-content-wrapper, this will produce clearfixes on the
			// inner elements, as well as add margins using this class.  The margins could not be applied
			// to the parent class directive AND have clearfixes, so we had to separate the two.
			template : '<div class="ag-floating-label-content-wrapper"><ng-transclude></ng-transclude></div>',
			controller: ContainerCtrl
		};
	}

	// Create
	angular
		.module('agFloatingLabel')
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

			var label = containerCtrl.element[0].querySelector('label');
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
	angular.module('agFloatingLabel')
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
	angular.module('agFloatingLabel')
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

	// angular.module('agFloatingLabel')
	// 	.directive('ngMessage', ngMessageDirective)
})(window.angular);
(function (angular) {

	function selectDirective($agUtil) {
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
			if (!containerCtrl)	return;
			if(!ngModelCtrl) {
				if(console && console.warn) {
					console.warn('A select directive has been created without an ngModel.  This is likely not intentional');
				}
				return;
			}
			if (containerCtrl.input) {
				throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			}

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
			};

			scope.$watch(function(){
				return ngModelCtrl && ngModelCtrl.$touched
			}, function(value) {
				containerCtrl.setTouched(ngModelCtrl.$touched);
			});

			scope.$watch(isErrorGetter, containerCtrl.setInvalid);

			// After selecting an input, we want to remove the highlighting
			// by default, the select box remains focused, so let's unfocus it.
			scope.$watch(function(){
				return ngModelCtrl.$viewValue
			}, function(value){
				if(value) {
					// blur it because the class is being set below.  We need to blur it as well
					inputCheckValue();
					// caused problems with error:required still showing up after selection.
					// todo - see if this is still necessary
					$agUtil.nextTick(function(){
						// element[0].blur();
					})
					containerCtrl.setFocused(false);
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
					$agUtil.nextTick(function() {
						containerCtrl.setFocused(true);
					});
				})
				.on('blur', function(ev) {
					$agUtil.nextTick(function() {
						inputCheckValue();
						containerCtrl.setFocused(false);
					});
				});

			function inputCheckValue() {
				// An input's value counts if its length > 0,
				// or if the input's validity state says it has bad input (eg string in a number input)
				containerCtrl.setHasValue(element.val().indexOf("undefined:undefined") == -1 &&
					(element.val().length > 0 || (element[0].validity || {}).badInput));
			}
		}
	}
	angular.module('agFloatingLabel')
		.directive('select', ['$agUtil', selectDirective])
})(window.angular);
(function(angular) {
	function inputTextareaDirective($agUtil, $window) {
		return {
			restrict: 'E',
			require: ['^?agFloatingLabel', '?ngModel'],
			link: postLink
		};

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
		function postLink(scope, element, attr, ctrls) {
			var containerCtrl = ctrls[0];
			var hasNgModel = !!ctrls[1];
			var ngModelCtrl = ctrls[1] || $agUtil.fakeNgModel();
			var isReadonly = angular.isDefined(attr.readonly);

			if (!containerCtrl) return;
			if (attr.type === 'hidden') {
				element.attr('aria-hidden', 'true');
				return;
			} else if (containerCtrl.input) {
				throw new Error("<ag-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			}
			containerCtrl.input = element;

			// Add an error spacer div after our input to provide space for the char counter and any ng-messages
			var errorsSpacer = angular.element('<div class="ag-errors-spacer">');
			element.after(errorsSpacer);

			// if (!containerCtrl.label) {
			// 	$mdAria.expect(element, 'aria-label', element.attr('placeholder'));
			// }

			element.addClass('ag-input');
			// if (!element.attr('id')) {
			// 	element.attr('id', 'input_' + $agUtil.nextUid());
			// }

			if (element[0].tagName.toLowerCase() === 'textarea') {
				setupTextarea();
			}
			// If the input doesn't have an ngModel, it may have a static value. For that case,
			// we have to do one initial check to determine if the container should be in the
			// "has a value" state.
			if (!hasNgModel) {
				inputCheckValue();
			}

			var isErrorGetter = containerCtrl.isErrorGetter || function () {
					return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
				};

			var isParentFormSubmitted = function () {
				var parent = $agUtil.getClosest(element, 'form');
				// todo figure out how this works exactly, it is interesting
				var form = parent ? angular.element(parent).controller('form') : null;

				return form ? form.$submitted : false;
			};

			scope.$watch(isErrorGetter, containerCtrl.setInvalid);

			var label = containerCtrl.element[0].querySelector('label');
			wrapInput(scope, element);
			scope.inputWrapper.prepend(label);

			ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
			ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

			element.on('input', inputCheckValue);
			if (!isReadonly) {
				element
					.on('focus', function (ev) {
						$agUtil.nextTick(function () {
							containerCtrl.setFocused(true);
						});
					})
					.on('blur', function (ev) {
						$agUtil.nextTick(function () {
							containerCtrl.setFocused(false);
							inputCheckValue();
						});
					});
			}

			//ngModelCtrl.$setTouched();
			//if( ngModelCtrl.$invalid ) containerCtrl.setInvalid();

			scope.$on('$destroy', function () {
				containerCtrl.setFocused(false);
				containerCtrl.setHasValue(false);
				containerCtrl.input = null;
			});

			/**
			 *
			 */
			function ngModelPipelineCheckValue(arg) {
				containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
				return arg;
			}

			function inputCheckValue() {
				// An input's value counts if its length > 0,
				// or if the input's validity state says it has bad input (eg string in a number input)
				containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
			}

			function setupTextarea() {
				if (angular.isDefined(element.attr('ag-no-autogrow'))) {
					return;
				}

				var node = element[0];
				var container = containerCtrl.element[0];

				var min_rows = NaN;
				var lineHeight = null;
				// can't check if height was or not explicity set,
				// so rows attribute will take precedence if present
				if (node.hasAttribute('rows')) {
					min_rows = parseInt(node.getAttribute('rows'));
				}

				var onChangeTextarea = $agUtil.debounce(growTextarea, 1);

				function pipelineListener(value) {
					onChangeTextarea();
					return value;
				}

				if (ngModelCtrl) {
					ngModelCtrl.$formatters.push(pipelineListener);
					ngModelCtrl.$viewChangeListeners.push(pipelineListener);
				} else {
					onChangeTextarea();
				}
				element.on('keydown input', onChangeTextarea);

				if (isNaN(min_rows)) {
					element.attr('rows', '1');

					element.on('scroll', onScroll);
				}

				angular.element($window).on('resize', onChangeTextarea);

				scope.$on('$destroy', function () {
					angular.element($window).off('resize', onChangeTextarea);
				});

				function growTextarea() {
					// sets the md-input-container height to avoid jumping around
					container.style.height = container.offsetHeight + 'px';

					// temporarily disables element's flex so its height 'runs free'
					//element.addClass('md-no-flex');

					if (isNaN(min_rows)) {
						node.style.height = "auto";
						node.scrollTop = 0;
						var height = getHeight();
						if (height) node.style.height = height + 'px';
					} else {
						node.setAttribute("rows", 1);

						if (!lineHeight) {
							node.style.minHeight = '0';

							lineHeight = element.prop('clientHeight');

							node.style.minHeight = null;
						}

						var rows = Math.min(min_rows, Math.round(node.scrollHeight / lineHeight));
						node.setAttribute("rows", rows);
						node.style.height = lineHeight * rows + "px";
					}

					// reset everything back to normal
					//element.removeClass('md-no-flex');
					container.style.height = 'auto';
				}

				function getHeight() {
					var line = node.scrollHeight - node.offsetHeight;
					return node.offsetHeight + (line > 0 ? line : 0);
				}

				function onScroll(e) {
					node.scrollTop = 0;
					// for smooth new line adding
					var line = node.scrollHeight - node.offsetHeight;
					var height = node.offsetHeight + line;
					node.style.height = height + 'px';
				}

				// Attach a watcher to detect when the textarea gets shown.
				if (angular.isDefined(element.attr('ag-detect-hidden'))) {

					var handleHiddenChange = function () {
						var wasHidden = false;

						return function () {
							var isHidden = node.offsetHeight === 0;

							if (isHidden === false && wasHidden === true) {
								growTextarea();
							}

							wasHidden = isHidden;
						};
					}();

					// Check every digest cycle whether the visibility of the textarea has changed.
					// Queue up to run after the digest cycle is complete.
					scope.$watch(function () {
						$agUtil.nextTick(handleHiddenChange, false);
						return true;
					});
				}
			}
		}
	}

	inputTextareaDirective.$inject = ["$agUtil", "$window"];

	angular.module('agFloatingLabel')
		.directive('textarea', inputTextareaDirective);
})(window.angular);