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