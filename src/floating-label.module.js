(function(angular) {
    'use strict';
    var app = angular.module('agFloatingLabel', ['ngMessages', 'ngAnimate']);
	app.config(function($animateProvider){
		$animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/)
	});
})(window.angular);