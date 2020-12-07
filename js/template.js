/*jshint laxbreak:true */
(function (window) {
	'use strict';

	let htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#x27;',
		'`': '&#x60;'
	};

	let escapeHtmlChar = function (chr) {
		return htmlEscapes[chr];
	};

	let reUnescapedHtml = /[&<>"'`]/g;
	let reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

	let escape = function (string) {
		return (string && reHasUnescapedHtml.test(string))
			? string.replace(reUnescapedHtml, escapeHtmlChar)
			: string;
	};

	/**
	 * Définit les valeurs par défaut du template.
	 * @constructor
	 */
	function Template() {
		this.defaultTemplate
		=	'<li data-id="{{id}}" class="{{completed}}">'
		+		'<div class="view">'
		+			'<input class="toggle" type="checkbox" {{checked}}>'
		+			'<label>{{title}}</label>'
		+			'<button class="destroy"></button>'
		+		'</div>'
		+	'</li>';
	}

	/**
	 * Récupère le template par défaut et y injecte les informations de la nouvelle entrée.
	 * @param {object} (data) L'objet contenant les clés que vous souhaitez trouver
	 * dans le modèle à remplacer.
	 * @returns {string} Chaîne HTML d'un élément <li>.
	 *
	 * @example
	 * view.show({
	 *	id: 1,
	 *	title: "Hello World",
	 *	completed: 0,
	 * });
	 */
	Template.prototype.show = function (data) {
		let i, l;
		let view = '';

		for (i = 0, l = data.length; i < l; i++) {
			let template = this.defaultTemplate;
			let completed = '';
			let checked = '';

			if (data[i].completed) {
				completed = 'completed';
				checked = 'checked';
			}

			template = template.replace('{{id}}', data[i].id);
			template = template.replace('{{title}}', escape(data[i].title));
			template = template.replace('{{completed}}', completed);
			template = template.replace('{{checked}}', checked);

			view = view + template;
		}

		return view;
	};

	/**
	 * Affiche le nombre d’entrées actives restantes.
	 * @param {number} (activeTodos) Le nombre de to-dos actifs.
	 * @returns {string} Une chaine contenant le nombre.
	 */
	Template.prototype.itemCounter = function (activeTodos) {
		let plural = activeTodos === 1 ? '' : 's';

		return '<strong>' + activeTodos + '</strong> item' + plural + ' left';
	};

	/**
	 * Affiche le bouton « Clear completed » dès qu’une entrée est terminée.
	 * @param  {[type]} (completedTodos) Le nombre de todos achevés.
	 * @returns {string} Une chaine contenant le nombre.
	 */
	Template.prototype.clearCompletedButton = function (completedTodos) {
		if (completedTodos > 0) {
			return 'Clear completed';
		} else {
			return '';
		}
	};

	// Exporte vers window
	window.app = window.app || {};
	window.app.Template = Template;
})(window);
