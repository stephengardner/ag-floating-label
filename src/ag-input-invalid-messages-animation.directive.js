
(function (angular) {
	function agInputInvalidMessagesAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				var messages = getMessagesElement(element);

				if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
					showInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
			// ,
			// removeClass : function(element, className, done) {
			// 	var messages = getMessagesElement(element);
			// 	if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
			// 		hideInputMessages(element, $animateCss, $q).finally(done);
			// 	} else {
			// 		done();
			// 	}
			// }

		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function agHintsActiveAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				var messages = getHintsElement(element);

				if (className == "ag-hints-active") {
					showHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			,
			removeClass : function(element, className, done) {
				if (className == "ag-hints-active") {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function ngMessagesAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
				alert("ngMessagesAnimation enter");
				showInputMessages(element, $animateCss, $q).finally(done);
			},

			leave: function(element, done) {
				hideInputMessages(element, $animateCss, $q).finally(done);
			},

			addClass: function(element, className, done) {
				if (className == "ng-hide") {
					hideInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			},

			removeClass: function(element, className, done) {
				if (className == "ng-hide") {
					showInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
		}
	}
	ngMessagesAnimation.$inject = ["$q", "$animateCss"];

	function ngMessageAnimation($agUtil, $animateCss) {
		return {
			enter: function(element, done) {
				// Available on Angular-material, but here, this seems to cause issues.  Perhaps
				// because we're not explicitly setting a CSS animation for this.
				// The reason we don't set that is because we don't just want margin -100px, we want an actual px
				// calculation every time, it's more accurate.
				var messages = getMessagesElement(element);
				var parent = $agUtil.getClosest(element, 'form');
				var form = parent ? angular.element(parent) : null;



				// Fix for when two errors are on the element and one hides but the other needs to show, such as
				// 'required' and 'minlength', the minlength ends but the required hits.  This will help that.
				// check to make sure the actual input is not completely valid AND there's no ag-auto-hide.
				var input = getInputElement(element);
				var isInvalid = input.hasClass('ag-input-invalid');
				if (messages.hasClass('ag-auto-hide') && !isInvalid) {
					return autoHide(element, $animateCss);
				}

				return showMessage(element, $animateCss);
			},

			leave: function(element, done) {
				return hideMessage(element, $animateCss);
			}
		}
	}
	ngMessageAnimation.$inject = ["$agUtil", "$animateCss"];


	function agHintsAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
				showHintMessages(element, $animateCss, $q).finally(done);
			},

			leave: function(element, done) {
				hideHintMessages(element, $animateCss, $q).finally(done);
			},

			addClass: function(element, className, done) {
				if (className == "ng-hide") {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			},

			removeClass: function(element, className, done) {
				if (className == "ng-hide") {
					showHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
		}
	}
	ngMessagesAnimation.$inject = ["$q", "$animateCss"];

	function agHintAnimation($animateCss) {
		return {
			enter: function(element, done) {
				var messages = getMessagesElement(element);
				// If we have the md-auto-hide class, the md-input-invalid animation will fire, so we can skip
				if (messages.hasClass('ag-auto-hide')) {
					done();
					return;
				}

				return showMessage(element, $animateCss);
			},

			leave: function(element, done) {
				return hideMessage(element, $animateCss);
			}
		}
	}

	function showInputMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getMessagesElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = showMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	function hideInputMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getMessagesElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = hideMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}



	function showMessage(element, $animateCss) {
		var height = element[0].offsetHeight;
		return $animateCss(element, {
			event: 'enter',
			structural: true,
			from: {"opacity": 0, "margin-top": -height + "px"},
			to: {"opacity": 1, "margin-top": "0"},
			duration: .3
		});
	}

	function hideMessage(element, $animateCss) {
		var height = element[0].offsetHeight;
		var styles = window.getComputedStyle(element[0]);

		// If we are already hidden, just return an empty animation
		if (styles.opacity == 0) {
			return $animateCss(element, {});
		}

		// Otherwise, animate
		return $animateCss(element, {
			event: 'leave',
			structural: true,
			from: {"opacity": 1, "margin-top": '0px'},
			to: {"opacity": 0, "margin-top": -height + "px"},
			duration: .3
		});
	}

	// Fix to auto hide an element so that there's no flicker.
	function autoHide(element, $animateCss) {
		var height = element[0].offsetHeight;
		var styles = window.getComputedStyle(element[0]);
		return $animateCss(element, {
			event: 'leave',
			structural: true,
			from: {"opacity": 0, "margin-top": -height + "px"},
			to: {"opacity": 0, "margin-top": -height + "px"},
			duration: 0
		});
	}

	function getInputElement(element) {
		var inputContainer = element.controller('agFloatingLabel');
		return inputContainer.element;
	}

	function getMessagesElement(element) {
		var input = getInputElement(element);
		var selector = 'ng-messages,data-ng-messages,x-ng-messages,' +
			'[ng-messages],[data-ng-messages],[x-ng-messages]';

		return angular.element(input[0].querySelector(selector));
	}
	
	function getHintsElement(element) {
		var input = getInputElement(element);
		var selector = 'ag-hints';

		return angular.element(input[0].querySelector(selector));
	}

	function showHintMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getHintsElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = showMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	function hideHintMessages(element, $animateCss, $q) {
		var animators = [], animator;
		var messages = getHintsElement(element);

		angular.forEach(messages.children(), function(child) {
			animator = hideMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	angular
		.module('agFloatingLabel')
		.animation('.ag-input-invalid', agInputInvalidMessagesAnimation)
		.animation('.ag-hints-active', agHintsActiveAnimation)
		.animation('.ag-input-messages-animation', ngMessagesAnimation)
		.animation('.ag-input-message-animation', ngMessageAnimation)
		.animation('.ag-input-hints-animation', agHintsAnimation);
})(window.angular);