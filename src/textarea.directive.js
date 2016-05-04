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

	angular.module('agFloatingLabel').directive('textarea', inputTextareaDirective);
})(window.angular);