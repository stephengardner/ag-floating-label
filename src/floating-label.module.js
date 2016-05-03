(function(angular) {
    'use strict';

    var app = angular.module('components', ['ngMessages', 'ngAnimate']);
	app.config(function($logProvider){
		$logProvider.debugEnabled(true);
	});
})(window.angular);