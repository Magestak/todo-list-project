/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Créé une nouvelle base de données dans le LocalStorage du navigateur si elle n’existe pas déjà.
	 * @param {string} (name) Le nom de la base de données.
	 * @param {function} (callback) La fonction de rappel.
	 */
	function Store(name, callback) {
		callback = callback || function () {};

		this._dbName = name;

		if (!localStorage[name]) {
			let data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Récupère une donnée dans la base de données à partir d’une requête (query).
	 * @param {object} (query) La requête à comparer (c'est-à-dire {foo : 'bar').
	 * @param {function} (callback)	 La fonction de rappel à déclencher lorsque l' exécution
	 * de la requête est terminée.
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // Données retournera tous les éléments qui ont foo: bar et
	 *	 // hello: world dans leurs propriétés
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		let todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (let q in query) {
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Récupère toutes les données de la base de données.
	 * @param {function} (callback) La fonction de rappel lors de la récupération des données.
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () {};
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Enregistre (si elle n’existe pas) ou met à jour (si elle existe) une entrée dans la
	 base de données.
	 * @param {object} (updateData) Les données à sauvegarder dans la base de données.
	 * @param {function} (callback) La fonction de rappel après l'enregistrement.
	 * @param {number} (id) Un paramètre optionnel correspondant à l'élément à mettre à jour.
	 */
	Store.prototype.save = function (updateData, callback, id) {
		let data = JSON.parse(localStorage[this._dbName]);
		let todos = data.todos;

		callback = callback || function () {};

		// Correction bug 2 = conflit éventuel entre deux IDs identiques
		// Generate unique ID
		let newId = (new Date().getTime());
		console.log(newId);
	    let charset = "0123456789";

        for (let i = 0; i < 6; i++) {
     		newId += charset.charAt(Math.floor(Math.random() * charset.length));
		}

		// Si un ID a été donné, trouve l'élément et met à jour les propriétés.
		if (id) {
			for (let i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (let key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		} else {

    		// Assign an ID
			updateData.id = parseInt(newId);
    

			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}
	};

	/**
	 * Supprime une entrée de la base en fonction de son identifiant.
	 * @param {number} (id ) L'ID de l'entrée à supprimer.
	 * @param {function} (callback) La fonction de rappel après l'enregistrement.
	 */
	Store.prototype.remove = function (id, callback) {
		let i;
		let data = JSON.parse(localStorage[this._dbName]);
		let todos = data.todos;
		let todoId;

		for (i = 0; i < todos.length; i++) {
			if (todos[i].id === id) {
				todoId = todos[i].id;
			}
		}

		for (i = 0; i < todos.length; i++) {
			if (todos[i].id === todoId) {
				todos.splice(i, 1);
			}
		}

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, todos);
	};

	/**
	 * Supprime la base de données et en démarre une nouvelle.
	 * @param {function} (callback) La fonction de rappel après la suppression de la base.
	 */
	Store.prototype.drop = function (callback) {
		let data = {todos: []};
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Exporte vers window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);