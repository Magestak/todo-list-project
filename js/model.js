(function (window) {
	'use strict';

	/**
	 *  Créé un nouveau modèle et lui associe une base de données (LocalStorage).
	 * @constructor
	 * @param {object} (storage) Une référence à la classe de stockage côté client.
	 */
	function Model(storage) {
		this.storage = storage;
	}

	/**
	 * Créé un nouveau modèle pour la to-do.
	 * @param {string} (title) Le contenu de la tâche.
	 * @param {function} (callback) La fonction de rappel après la création du modèle.
	 */
	Model.prototype.create = function (title, callback) {
		title = title || '';
		callback = callback || function () {};

		let newItem = {
			title: title.trim(),
			completed: false
		};

		this.storage.save(newItem, callback);
	};

	/**
	 * Récupère dans la base un modèle to-do selon une requête (ID ou nom). Si
	 * l’argument requête n’est pas renseigné, cela retourne toutes les entrées de la base.
	 * @param {string|number|object} (query) Une requête pour faire correspondre les modèles.
	 * @param {function} (callback) La fonction de rappel après la découverte du modèle.
	 * @example
	 * model.read(1, func); // Trouvera le model avec un ID de 1.
	 * model.read('1'); // Comme ci-dessus.
	 * // Vous trouverez ci-dessous un modèle avec foo égal à bar et un hello égal à world.
	 * model.read({ foo: 'bar', hello: 'world' });
	 */
	Model.prototype.read = function (query, callback) {
		let queryType = typeof query;
		callback = callback || function () {};

		if (queryType === 'function') {
			callback = query;
			return this.storage.findAll(callback);
		} else if (queryType === 'string' || queryType === 'number') {
			query = parseInt(query, 10);
			this.storage.find({ id: query }, callback);
		} else {
			this.storage.find(query, callback);
		}
	};

	/**
	 * Met à jour un to-do en le sauvegardant dans la base.
	 * @param {number} (id) L'ID du to-do à mettre à jour.
	 * @param {object} (data) Les propriétés à mettre à jour avec les nouvelles valeurs.
	 * @param {function} (callback) La fonction de rappel quand la mise à jour est terminée.
	 */
	Model.prototype.update = function (id, data, callback) {
		this.storage.save(data, callback, id);
	};

	/**
	 * Supprime un to-do de la base de données.
	 * @param {number} (id) L'ID du to-do à supprimer.
	 * @param {function} (callback) La fonction de rappel lorsque la suppression est terminée.
	 */
	Model.prototype.remove = function (id, callback) {
		this.storage.remove(id, callback);
	};

	/**
	 * ATTENTION: Supprime toutes les données de la base.
	 * @param {function} (callback) La fonction de rappel quand le stockage est vide.
	 */
	Model.prototype.removeAll = function (callback) {
		this.storage.drop(callback);
	};

	/**
	 * Retourne le compte de tous les to-dos.
	 * @param {function} (callback) La fonction de rappel.
	 */
	Model.prototype.getCount = function (callback) {
		let todos = {
			active: 0,
			completed: 0,
			total: 0
		};

		// Récupère toutes les données.
		this.storage.findAll(function (data) {
			data.forEach(function (todo) {
				if (todo.completed) {
					todos.completed++;
				} else {
					todos.active++;
				}

				todos.total++;
			});
			callback(todos);
		});
	};

	// Exporte vers window.
	window.app = window.app || {};
	window.app.Model = Model;
})(window);
