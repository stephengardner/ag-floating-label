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
	angular.module('agFloatingLabel')
		.directive('placeholder', placeholderDirective)
})(window.angular);