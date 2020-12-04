/*global app, $on */
(function () {
	'use strict';

	/**
	 * Initialise une toute nouvelle to-do-list.
	 *
	 * @param {string} (name) Le nom de votre nouvelle to-do-list.
	 */
	function Todo(name) {
		this.storage = new app.Store(name);
		this.model = new app.Model(this.storage);
		this.template = new app.Template();
		this.view = new app.View(this.template);
		this.controller = new app.Controller(this.model, this.view);
	}

	/**
	 * Définit un nouveau to-do.
	 */
	let todo = new Todo('todos-vanillajs');

	/**
	 * Gère le chargement de la vue via le contrôleur en fonction de l’url.
	 */
	function setView() {
		todo.controller.setView(document.location.hash);
	}
	$on(window, 'load', setView);
	$on(window, 'hashchange', setView);
})();
