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