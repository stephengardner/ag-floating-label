/*

 A Vanilla JS alternative for jQuery's wrapInner()
 innerwrap an HTML element with the option to add an attribute & value with it.
 Derived from:
 http://stackoverflow.com/questions/21817538/how-can-i-implement-jquerys-wrapinner-function-in-plain-javascript

 Usage
 ------
 Four parameters you can use:
 'parent'           = the element that needs to be innerwrapped
 'wrapper'          = the element that will innerwrap the parent
 'attribute'        = the attribute that you need this innerwrapped element to have
 'attributevalue'   = the value of the attribute you've just created

 Example
 -------
 wrapInner('body', 'div', 'class', 'my-class');

 */

var background = document.querySelector("#unique");
var bodyinner  = document.body;
var divtag     = document.querySelector("div");


//Check if the body element has an ID of #unique
// if (divtag.hasAttribute("id", "#unique")) {
// 	wrapInner(bodyinner, 'div', 'id', 'innerwrapped-element');
// }

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


	function getElementOffset(element)
	{
		var de = document.documentElement;
		var box = element.getBoundingClientRect();
		var top = box.top + window.pageYOffset - de.clientTop;
		var left = box.left + window.pageXOffset - de.clientLeft;
		return { top: top, left: left };
	}

	function ContainerCtrl($scope, $element, $attrs, $animate, $timeout, $agUtil) {
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
			if(isFocused && !self.invalid && ! self.hintsActive) {
				self.setHints(true);
			}
			else {
				self.setHints(false);
			}
		};

		self.setInvalid = function(isInvalid) {
			self.invalid = isInvalid;
			if (isInvalid) {
				$animate.addClass($element, 'ag-input-invalid');
				self.setHints(false);
			} else {
				$animate.removeClass($element, 'ag-input-invalid');
				self.setHints(self.focused || self.hintsActive);
			}
		};

		self.setHints = function(isActive) {
			self.hintsActive = isActive;
			$element.toggleClass('ag-input-has-hints', !!isActive);
			if (isActive && !self.invalid) {
				$animate.addClass($element, 'ag-hints-active');
			} else {
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

		self.offsetLeft = getElementOffset(self.element[0]);
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
			restrict: 'E',
			scope: true,
			link: postLink,
			transclude : true,
			// Wrap the content in an ag-floating-label-content-wrapper, this will produce clearfixes on the
			// inner elements, as well as add margins using this class.  The margins could not be applied
			// to the parent class directive AND have clearfixes, so we had to separate the two.
			template : '<div class="ag-floating-label-content-wrapper"><ng-transclude></ng-transclude></div>',
			controller: ContainerCtrl
		};
	}

	// Create
	angular
		.module('agFloatingLabel')
		.directive('agFloatingLabel', floatingLabelDefinition);
})(window.angular);