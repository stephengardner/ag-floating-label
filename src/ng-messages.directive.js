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