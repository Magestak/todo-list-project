/*global NodeList */
(function (window) {
	'use strict';

	/**
	 * Simplifie la méthode querySelector.
	 * @param {string} (selector) Argument sélecteur.
	 * @param {string} (scope) Contexte d'utilisation.
	 * @returns {*} Le premier élément descendant de baseElement qui correspond au groupe de sélecteurs spécifié.
	 */
	window.qs = function (selector, scope) {
		return (scope || document).querySelector(selector);
	};

	/**
	 * Simplifie la méthode querySelectorAll.
	 * @param {string} (selector) Argument(s) sélecteur.
	 * @param (scope) Contexte d'utilisation.
	 * @returns {NodeListOf<*>} Une NodeList statique contenant un objet Element pour chaque élément
	 * qui correspond à au-moins un des sélecteurs spécifiés ou une NodeList vide si aucune correspondance n'est trouvée .
	 */
	window.qsa = function (selector, scope) {
		return (scope || document).querySelectorAll(selector);
	};

	/**
	 * Créé un écouteur d’évènement à l’aide de la méthode addEventListener sur l’élément choisi.
	 * @param {object} (target) La cible de l'écouteur.
	 * @param {string} (type) Le type d'évènement à écouter.
	 * @param {function} (callback) La fonction à appliquer.
	 * @param {boolean} (useCapture) Un  Boolean indiquant si les événements de ce type seront
	 * distribués à l'écouteur enregistré avant d'être distribués à toute EventTarget (cible d'évènement)
	 * située en-dessous dans l'arborescence DOM.
	 */
	window.$on = function (target, type, callback, useCapture) {
		target.addEventListener(type, callback, !!useCapture);
	};

	/**
	 * Attache un gestionnaire à l'événement pour tous les éléments qui correspondent au sélecteur,
	 * existant ou futur, sur la base d'un élément racine.
 	 * @param {object} (target) La cible.
	 * @param {string} (selector) Le sélecteur.
	 * @param {string} (type) Le type dévènement.
	 * @param {function} (handler) La fonction à appliquer.
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
	 * Récupère le parent d’un élément HTML en précisant la balise recherchée (tagName).
	 * @param {object} (element) L'élément actif.
	 * @param {string} (tagName) Le tagname recherché.
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

	// Permet de faire des boucles sur les nœuds:
	// qsa('.foo').forEach(function () {})
	NodeList.prototype.forEach = Array.prototype.forEach;
})(window);
