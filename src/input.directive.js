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
			// var containerCtrl = ctrls[0];
			// var hasNgModel = !!ctrls[1];
			// var ngModelCtrl = ctrls[1];
			// var isReadonly = angular.isDefined(attr.readonly);
			// if (!containerCtrl) return;
			// if (containerCtrl.input) {
			// 	throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");
			// }

			// var isErrorGetter = containerCtrl.isErrorGetter || function() {
			// 		console.log("Returning ", ngModelCtrl.$invalid + " && " + ngModelCtrl.$touched);
			// 		return ngModelCtrl.$invalid && (ngModelCtrl.$touched || isParentFormSubmitted());
			// 	};
			// console.log("label is:", label);
			// var isParentFormSubmitted = function () {
			// 	var parent = false;//$mdUtil.getClosest(element, 'form');
			// 	var form = parent ? angular.element(parent).controller('form') : null;
			//
			// 	return form ? form.$submitted : false;
			// };
			//
			// var isErrorGetter = function() {
			// 	// added ngModelCtrl.$dirty
			// 	// $touched is only applied after exiting the input
			// 	return containerCtrl.isErrorGetter
			// 		|| (ngModelCtrl.$invalid && (ngModelCtrl.$touched/* || ngModelCtrl.$dirty*/));
			// }
			// scope.$watch(function(){
			// 	return ngModelCtrl.$touched
			// }, function(value) {
			// 	// containerCtrl.setTouched(ngModelCtrl.$touched);
			// })
			// scope.$watch(isErrorGetter, containerCtrl.setInvalid);
			// scope.$watch(isErrorGetter, containerCtrl.setInvalid);

			// var label = containerCtrl.element[0].querySelector('label');
			// wrapInput(scope, element);
			// scope.inputWrapper.prepend(label);

			// Add an error spacer div after our input to provide space for the char counter and any ng-messages
			// var errorsSpacer = angular.element('<div class="ag-errors-spacer">');
			// var inputGroup = containerCtrl.element[0].querySelector('.ag-input-group, .input-group');
			// if(inputGroup) {
			// 	angular.element(inputGroup).after(errorsSpacer);
			// }
			// else {
			// 	scope.inputWrapper.after(errorsSpacer);
			// }

			// ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
			// ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

			// function ngModelPipelineCheckValue(arg) {
			// 	// containerCtrl.setHasValue(!ngModelCtrl.$isEmpty(arg));
			// 	return arg;
			// }
			//
			// containerCtrl.input = element;
			element.addClass('ag-input');
			// element
			// 	.on('focus', function(ev) {
			// 		// $agUtil.nextTick(function() {
			// 		// 	containerCtrl.setFocused(true);
			// 		// });
			// 	})
			// 	.on('blur', function(ev) {
			// 		// $agUtil.nextTick(function(){
			// 		// 	containerCtrl.setFocused(false);
			// 		// 	inputCheckValue();
			// 		// });
			// 	});
			// function inputCheckValue() {
			// 	// An input's value counts if its length > 0,
			// 	// or if the input's validity state says it has bad input (eg string in a number input)
			// 	containerCtrl.setHasValue(element.val().length > 0 || (element[0].validity || {}).badInput);
			// }
		}
	}
	angular.module('agFloatingLabel')
		.directive('input', ['$agUtil', inputDirective])
})(window.angular);