/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * Get element(s) by CSS selector:
	 *
	 * @param {string} (selector) Selector argument.
	 * @param {string} (scope) Context of use.
	 *
	 * @returns {*} The first basic descending Element that corresponds to the specified selector group.
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * Simplifies the querySelectorAll method.
	 *
	 * @param {string} (selector) Selector argument.
	 * @param (scope) Context of use.
	 *
	 * @returns {NodeListOf<*>} A static NodeList containing one Element object for each element that matches at least
	 * one of the specified selectors or an empty NodeList if no match is found.
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * addEventListener wrapper:
	 *
	 * @param {object} (target) The target of the earphone.
	 * @param {string} (type) The type of event to listen to.
	 * @param {function} (callback) The function to be applied.
	 * @param {boolean} (useCapture) A Boolean indicating whether events of this type will be distributed to the registered
	 * listener before being distributed to any EventTarget below in the DOM tree.
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attach a handler to event for all elements that match the selector,
	 * now or in the future, based on a root element.
	 *
 	 * @param {object} (target) The target.
	 * @param {string} (selector) The selector.
	 * @param {string} (type) The event type.
	 * @param {function} (handler) The function to be applied.
	 */
	window.$delegate = function (target, selector, type, handler) {
		function dispatchEvent(event) {
			let targetElement = event.target;
			let potentialElements = window.qsa(selector, target);
			let hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

			if (hasMatch) {
				handler.call(targetElement, event);
			}
		}

		// https://developer.mozilla.org/en-US/docs/Web/Events/blur
		let useCapture = type === 'blur' || type === 'focus';

		window.$on(target, type, dispatchEvent, useCapture);
	};

	/**
	 * Find the element's parent with the given tag name:
	 * $parent(qs('a'), 'div');
	 *
	 * @param {object} (element) The active element.
	 * @param {string} (tagName) The searched tagname.
	 */
	window.$parent = function (element, tagName) {
		if (!element.parentNode) {
			return;
		}
		if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
			return element.parentNode;
		}
		return window.$parent(element.parentNode, tagName);
	};

	// Allow for looping on nodes by chaining:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
