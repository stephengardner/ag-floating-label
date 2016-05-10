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
			require: '^^?agFloatingLabel',
			compile : compile
		};

		function compile(element, attrs) {
			element.toggleClass('ag-hints', true);
			return {
				post : function postLink(scope, element, attrs, agFloatingLabel) {
					// BEGIN DUPLICATE CODE
					if (!agFloatingLabel) return;
					var inputElement = agFloatingLabel.element[0].querySelector('input, select, textarea');

					scope.$watch(function() {
						return getElementOffset(inputElement).left
					}, function(oldValue, newValue) {
						if(oldValue != newValue) {
							center();
						}
					})

					// Deprecated, will re-allow for this in the future based on Options
					function undoCenter() {
						element.css('padding-left', '0px' );
					}
					function center() {
						element.toggleClass('ag-messages-auto-position', true);
						var inputOffset = getElementOffset(inputElement),
							agFloatingLabelOffset = getElementOffset(agFloatingLabel.element[0]),
							offsetLeftDifference = inputOffset.left - agFloatingLabelOffset.left,
							offsetLeftStyle = offsetLeftDifference + 'px'
							;
						element.css('padding-left', offsetLeftStyle);
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