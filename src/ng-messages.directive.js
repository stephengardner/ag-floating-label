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

		function postLink(scope, element, attrs, agFloatingLabel) {
			// If we are not a child of an input container, don't do anything
			if (!agFloatingLabel) return;

			// BEGIN DUPLICATE CODE
			var containerElement = agFloatingLabel.element,
				containerHasIcon = containerElement.find('ag-icon'),
				inputElement = agFloatingLabel.element[0].querySelector('input, select, textarea');

			scope.$watch(function() {
				return getElementOffset(inputElement).left
			}, function(oldValue, newValue) {
				if(!containerHasIcon && oldValue != newValue) {
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

	angular.module('agFloatingLabel')
		.directive('ngMessage', ngMessageDirective)
})(window.angular);