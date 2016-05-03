//
//
// A "Floating Label" directive using the placeholder attribute
// Based on https://github.com/jverdi/JVFloatLabeledTextField and https://github.com/maman/JVFloat.js
//
// By @klaascuvelier (http://www.klaascuvelier.be)
//
//
(function (angular) {
	'use strict';

	/**
	 * generate an NgModel key for the input box using it's attributes (id/name)
	 * @param {angular.element} inputBox
	 * @return {string}
	 */
	function generateNgModelKey(inputBox) {
		var inputId = inputBox.attr('id') || '',
			inputName = inputBox.attr('name') || '';

		if (inputId.length === 0 && inputName.length === 0) {
			throw 'If no ng-model is defined, the input should have an id or a name';
		}

		return 'input_' + (inputId ? inputId : inputName);
	}

	/**
	 * Post compile method
	 * @param $scope
	 * @param $element
	 */
	function floatingLabelPostCompileFunction ($scope, $element, $attrs)
	{
		var inputBox = $element.find('input'),
			ngModelKey = inputBox.attr('ng-model'),
			placeholderBackup = inputBox.attr('placeholder');

		$scope.showLabel = false;
		$scope.focus = false;
		$scope.label =

			$scope.$watch($scope.focus, function(value){
				console.log(value);
				//alert(value);
			});
		$scope.setFocus = function(bool) {
			$scope.focus = bool;
		};

		$scope.$watch('focus', function(value){
			if(value){
				placeholderBackup = inputBox.attr('placeholder');
				inputBox.attr('placeholder', '');// = '';
				$scope.showLabel = true;
			}
			else {
				$scope.showLabel = false;
				inputBox.attr('placeholder', placeholderBackup);
			}
		})
		$scope.$watch(ngModelKey, function (newValue) {
			// if the field is not empty, show the label, otherwise hide it
			$scope.showLabel = typeof newValue === 'string' && newValue.length > 0;
		});
	}

	function getElementOffset(element)
	{
		var de = document.documentElement;
		var box = element.getBoundingClientRect();
		var top = box.top + window.pageYOffset - de.clientTop;
		var left = box.left + window.pageXOffset - de.clientLeft;
		return { top: top, left: left };
	}

	function floatingLabelCompileFunction ($element, $attrs)
	{
		var templateAttributes = [
				'ng-focus="setFocus(true)"',
				'ng-blur="setFocus(false)"'
			],
			template, attr;

		// if there is no placeholder, there is no use for this directive
		if (!$attrs.placeholder) {
			//throw 'Floating label needs a placeholder';
		}
		if($attrs.placeholder) {
			// templateAttributes.push('placeholder="{{placeholderModel}}"');
		}

		// copy existing attributes from
		for (attr in $attrs) {
			if ($attrs.hasOwnProperty(attr) && attr.substr(0, 1) !== '$' && attr !== 'floatingLabel') {
				templateAttributes.push($attrs.$attr[attr] + '="' + $attrs[attr] + '"');
			}
		}


		return {
			post: floatingLabelPostCompileFunction
		};
	}

	// Add DI
	floatingLabelCompileFunction.$inject = ['$element', '$attrs'];


	// Add DI
	floatingLabelPostCompileFunction.$inject = ['$scope', '$element', '$attrs'];


	function ContainerCtrl($scope, $element, $attrs, $animate) {
		var self = this;
		self.element = $element,
			self.invalid = false,
			self.hintsActive = false,
			self.focused = false,
			self.hasLabel = false
		;

		self.isErrorGetter = $attrs.agIsError && $parse($attrs.agIsError);

		$element.addClass('ag-floating-label');

		self.setHasValue = function(hasValue) {
			$element.toggleClass('ag-input-has-value', !!hasValue);
		};
		self.setHasPlaceholder = function(hasPlaceholder) {
			$element.toggleClass('ag-input-has-placeholder', !!hasPlaceholder);
		};
		self.setFocused = function(isFocused) {
			self.focused = isFocused;
			$element.toggleClass('ag-input-focused', !!isFocused);
			if(isFocused) {
				console.log("isFocused");
				self.setHints(true);
			}
			else {
				console.log("isNOTFocused");
				self.setHints(false);
			}
			//self.setHints(isFocused && !self.invalid);
		};
		self.setInvalid = function(isInvalid) {
			self.invalid = isInvalid;
			if (isInvalid) {
				$animate.addClass($element, 'ag-input-invalid');
				self.setHints(false);
			} else {
				self.setHints(self.focused || self.hintsActive);
				$animate.removeClass($element, 'ag-input-invalid');
			}
		};
		self.setHints = function(isActive) {
			self.hintsActive = isActive;
			$element.toggleClass('ag-input-has-hints', !!isActive);
			if (isActive && !self.invalid) {
				console.log("setting HINTS ACTIVE");
				$animate.addClass($element, 'ag-hints-active');
			} else {
				console.log("setting HINTS INACTIVE");
				$animate.removeClass($element, 'ag-hints-active');
			}
		};
		self.setHasLabel = function(hasLabel) {
			self.hasLabel = hasLabel;
			$element.toggleClass('ag-input-has-label', !!hasLabel);
		};

		// Useful for error setting display:none when nothing has been touched
		self.setTouched = function(isTouched) {
			$element.toggleClass('ag-input-touched', !!isTouched);
		};

		console.log("OFFSET:", getElementOffset($element[0]));
		self.offsetLeft = getElementOffset(self.element[0]);
		//alert(self.element.offsetLeft);
	}

	function postLink(scope, element, attr) {
		if (element.find('ag-icon').length) element.addClass('ag-has-icon');
	}
	/**
	 * Return the definition for this directive
	 * @returns {Object}
	 */
	function floatingLabelDefinition() {
		return {
			restrict: 'A',
			scope: true,
			link: postLink,
			// compile: floatingLabelCompileFunction,
			controller: ContainerCtrl
		};
	}

	// Create
	angular
		.module('components')
		.directive('agFloatingLabel', floatingLabelDefinition);
})(window.angular);