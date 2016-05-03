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