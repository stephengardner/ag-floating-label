
(function (angular) {
	function agInputInvalidMessagesAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				console.log("AddClass");
				var messages = getMessagesElement(element);

				if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
					showInputMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			// ,
			// removeClass : function(element, className, done) {
			// 	console.log("RemoveClass");
			// 	var messages = getMessagesElement(element);
			// 	if (className == "ag-input-invalid" && messages.hasClass('ag-auto-hide')) {
			// 		hideInputMessages(element, $animateCss, $q).finally(done);
			// 	} else {
			// 		done();
			// 	}
			// }

			// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function agHintsActiveAnimation($q, $animateCss) {
		return {
			addClass: function(element, className, done) {
				console.log("HINTS AddClass");
				var messages = getHintsElement(element);

				if (className == "ag-hints-active" /*&& messages.hasClass('ag-auto-hide')*/) {
					showHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}
			,
			removeClass : function(element, className, done) {
				console.log("HINTS RemoveClass");
				// dont need this on hints
				//var messages = getMessagesElement(element);
				if (className == "ag-hints-active" /*&& messages.hasClass('ag-auto-hide')*/) {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			}

			// NOTE: We do not need the removeClass method, because the message ng-leave animation will fire
		}
	}
	agInputInvalidMessagesAnimation.$inject = ["$q", "$animateCss"];

	function ngMessagesAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
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

	function ngMessageAnimation($animateCss) {
		return {
			enter: function(element, done) {
				// Available on Angular-material, but here, this seems to cause issues.  Perhaps
				// because we're not explicitly setting a CSS animation for this.
				// The reason we don't set that is because we don't just want margin -100px, we want an actual px
				// calculation every time, it's more accurate.
				// var messages = getMessagesElement(element);
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
	ngMessageAnimation.$inject = ["$animateCss"];


	function agHintsAnimation($q, $animateCss) {
		return {
			enter: function(element, done) {
				console.log("agHintsAnimation.enter()");
				showHintMessages(element, $animateCss, $q).finally(done);
			},

			leave: function(element, done) {
				console.log("agHintsAnimation.leave()");
				hideHintMessages(element, $animateCss, $q).finally(done);
			},

			addClass: function(element, className, done) {
				console.log("agHintsAnimation.addClass()");
				if (className == "ng-hide") {
					hideHintMessages(element, $animateCss, $q).finally(done);
				} else {
					done();
				}
			},

			removeClass: function(element, className, done) {
				console.log("agHintsAnimation.removeClass()");
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
	ngMessageAnimation.$inject = ["$animateCss"];

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
			duration: 0.3
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
			from: {"opacity": 1, "margin-top": '1px'},
			to: {"opacity": 0, "margin-top": -height + "px"},
			duration: 0.3
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
		console.log("showHintMessages()");
		var animators = [], animator;
		var messages = getHintsElement(element);

		console.log("getHintsElement returned:", messages);

		angular.forEach(messages.children(), function(child) {
			console.log("ShowMessage for child:", child);
			animator = showMessage(angular.element(child), $animateCss);

			animators.push(animator.start());
		});

		return $q.all(animators);
	}

	function hideHintMessages(element, $animateCss, $q) {
		console.log("hideHintMessages()");
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