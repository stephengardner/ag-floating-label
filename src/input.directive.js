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
			var ngModelCtrl = ctrls[1] || $agUtil.fakeNgModel();
			var isReadonly = angular.isDefined(attr.readonly);

			if (!containerCtrl) return;

			if (element.find('ag-icon').length) element.addClass('ag-has-icon');

			if (attr.type === 'hidden') {
				element.attr('aria-hidden', 'true');
				return;
			} else if (containerCtrl.input) {
				throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			}
			containerCtrl.input = element;

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
			element.addClass('ag-input');
			if (!element.attr('id')) {
				//element.attr('id', 'input_' + $agUtil.nextUid());
			}

			// If the input doesn't have an ngModel, it may have a static value. For that case,
			// we have to do one initial check to determine if the container should be in the
			// "has a value" state.
			if (!hasNgModel) {
				inputCheckValue();
			}

			var isErrorGetter = containerCtrl.isErrorGetter || function() {
					return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
				};

			var isParentFormSubmitted = function () {
				var parent = $agUtil.getClosest(element, 'form');
				var form = parent ? angular.element(parent).controller('form') : null;

				return form ? form.$submitted : false;
			};

			//scope.$watch(ngModelCtrl.$touched, containerCtrl.setTouched);

			scope.$watch(isErrorGetter, containerCtrl.setInvalid);

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

			scope.$on('$destroy', function() {
				containerCtrl.setFocused(false);
				containerCtrl.setHasValue(false);
				containerCtrl.input = null;
			});

			function ngModelPipelineCheckValue(arg) {
				containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
				return arg;
			}

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