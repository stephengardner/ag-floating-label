(function (angular) {
	function agMessagesAutoPosition() {
		return {
			restrict: 'EA',
			link: postLink,
			// This is optional because we don't want target *all* ngMessage instances, just those inside of
			// mdInputContainer.
			require: '^^?agFloatingLabel'
		};

		function postLink(scope, element, attrs, agFloatingLabel) {
			if (!agFloatingLabel) return;
			scope.$watch(function(){
				return scope.$eval(attrs.agMessagesAutoPosition)
			}, function(newValue, oldValue){
				console.log('____agMessagedAutoPosition changing from : ', oldValue + ' to: ', newValue);
				if(newValue)
					center();
				else
					undoCenter();
			});

			var paddingLeftOld;
			function undoCenter() {
				element.css('padding-left', '0px' );
			}
			function center() {
				console.log("DoCenter");
				element.toggleClass('ag-messages-auto-position', true);
				var inputElement = agFloatingLabel.element[0].querySelector('input, select'),
					inputOffset = getElementOffset(inputElement),
					agFloatingLabelOffset = getElementOffset(agFloatingLabel.element[0]),
					offsetLeftDifference = inputOffset.left - agFloatingLabelOffset.left,
					offsetLeftStyle = offsetLeftDifference + 'px'
					;
				element.css('padding-left', offsetLeftStyle);
			}
		}
	}

	angular.module('components')
		.directive('agMessagesAutoPosition', agMessagesAutoPosition)
})(window.angular);

function getElementOffset(element)
{
	var de = document.documentElement;
	var box = element.getBoundingClientRect();
	var top = box.top + window.pageYOffset - de.clientTop;
	var left = box.left + window.pageXOffset - de.clientLeft;
	return { top: top, left: left };
}
