(function (window) {
	'use strict';

	/**
	 * Le controller établit le lien entre {@link Model} et {@Link View}.
	 * @constructor
	 * @param {object} (model) L'instance {@Link Model}.
	 * @param {object} (view) L'instance {@Link View}.
	 */
	function Controller(model, view) {
		let self = this;
		self.model = model;
		self.view = view;

		self.view.bind('newTodo', function (title) {
			self.addItem(title);
		});

		self.view.bind('itemEdit', function (item) {
			self.editItem(item.id);
		});

		self.view.bind('itemEditDone', function (item) {
			self.editItemSave(item.id, item.title);
		});

		self.view.bind('itemEditCancel', function (item) {
			self.editItemCancel(item.id);
		});

		self.view.bind('itemRemove', function (item) {
			self.removeItem(item.id);
		});

		self.view.bind('itemToggle', function (item) {
			self.toggleComplete(item.id, item.completed);
		});

		self.view.bind('removeCompleted', function () {
			self.removeCompletedItems();
		});

		self.view.bind('toggleAll', function (status) {
			self.toggleAll(status.completed);
		});
	}

	/**
	 * Charge et initialise {@Link View}.
	 * @param {string} (locationHash) Le hash de la page qui peut
	 * avoir les valeurs: '' | 'active' | 'completed'.
	 */
	Controller.prototype.setView = function (locationHash) {
		let route = locationHash.split('/')[1];
		let page = route || '';
		this._updateFilterState(page);
	};

	/**
	 * Affiche toutes les entrées présentes dans la base.
	 */
	Controller.prototype.showAll = function () {
		let self = this;
		self.model.read(function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Retourne toutes les tâches en cours.
	 */
	Controller.prototype.showActive = function () {
		let self = this;
		self.model.read({ completed: false }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Retourne toutes les tâches terminées.
	 */
	Controller.prototype.showCompleted = function () {
		var self = this;
		self.model.read({ completed: true }, function (data) {
			self.view.render('showEntries', data);
		});
	};

	/**
	 * Un événement à déclencher chaque fois que vous souhaitez ajouter un élément. Il suffit de passer
	 * l'objet événement et il se chargera de l'insertion dans le DOM et de la sauvegarde du nouvel objet.
	 * @param {string} (title) Le contenu du to-do.
	 */
	Controller.prototype.addItem = function (title) { // Etape 1: correction bug 1 = faute de frappe
		let self = this;

		if (title.trim() === '') {
			return;
		}

		self.model.create(title, function () {
			self.view.render('clearNewTodo');
			self._filter(true);
		});
	};

	/**
	 * Déclenche le mode édition d'un to-do.
	 * @param {number} (id) L'ID du to-do à éditer.
	 */
	Controller.prototype.editItem = function (id) {
		let self = this;
		self.model.read(id, function (data) {
			self.view.render('editItem', {id: id, title: data[0].title});
		});
	};

	/**
	 * Enregistre la modification d’un to-do.
	 * @param {number} (id) L'ID du to-do.
	 * @param {string} (title) Le contenu du to-do.
	 */
	Controller.prototype.editItemSave = function (id, title) {
		let self = this;

		while (title[0] === " ") {
			title = title.slice(1);
		}

		while (title[title.length-1] === " ") {
			title = title.slice(0, -1);
		}

		if (title.length !== 0) {
			self.model.update(id, {title: title}, function () {
				self.view.render('editItemDone', {id: id, title: title});
			});
		} else {
			self.removeItem(id);
		}
	};

	/**
	 * Annule la modification d'un to-do.
	 * @param {number} (id) L'ID du to-do à modifier.
	 */
	Controller.prototype.editItemCancel = function (id) {
		var self = this;
		self.model.read(id, function (data) {
			self.view.render('editItemDone', {id: id, title: data[0].title});
		});
	};

	/**
	 * Supprime un to-do du DOM et de la base.
	 * @param {number} (id) L'ID du to-do à supprimer.
	 */
	Controller.prototype.removeItem = function (id) {
		let self = this;
		let items;
		self.model.read(function(data) {
			items = data;
		});

		self.model.remove(id, function () {
			self.view.render('removeItem', id);
			console.log("Element with ID: " + id + " has been removed.");
		});

		self._filter();
	};

	/**
	 * Supprime toutes les entrées terminées.
	 */
	Controller.prototype.removeCompletedItems = function () {
		let self = this;
		self.model.read({ completed: true }, function (data) {
			data.forEach(function (item) {
				self.removeItem(item.id);
			});
		});

		self._filter();
	};

	/**
	 * Termine ou active un to-do dans la base (coche/décoche).
	 * @param {number} (id) L'ID du to-do
	 * @param {object} (completed) La checkbox du to-do
	 * @param {boolean|undefined} (silent) Empêcher le re-filtrage des éléments de tâche.
	 */
	Controller.prototype.toggleComplete = function (id, completed, silent) {
		let self = this;
		self.model.update(id, { completed: completed }, function () {
			self.view.render('elementComplete', {
				id: id,
				completed: completed
			});
		});

		if (!silent) {
			self._filter();
		}
	};

	/**
	 * Termine ou active toutes les entrées dans la base (coche/décoche).
	 * @param {object} (completed) La checkbox du to-do.
	 */
	Controller.prototype.toggleAll = function (completed) {
		let self = this;
		self.model.read({ completed: !completed }, function (data) {
			data.forEach(function (item) {
				self.toggleComplete(item.id, completed, true);
			});
		});

		self._filter();
	};

	/**
	 * Met à jour le nombre de to-do actifs restants.
	 */
	Controller.prototype._updateCount = function () {
		let self = this;
		self.model.getCount(function (todos) {
			self.view.render('updateElementCount', todos.active);
			self.view.render('clearCompletedButton', {
				completed: todos.completed,
				visible: todos.completed > 0
			});

			self.view.render('toggleAll', {checked: todos.completed === todos.total});
			self.view.render('contentBlockVisibility', {visible: todos.total > 0});
		});
	};

	/**
	 * Filtre les to-do en fonction de leur statut (All, Active ou Completed).
	 * @param {boolean|undefined} (force)  Refiltre les todos.
	 */
	Controller.prototype._filter = function (force) {
		let activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

		// Mettre à jour les éléments sur la page qui changent à chaque fois.
		this._updateCount();

		// Si la dernière route active n'est pas "All", ou si nous changeons de route,nous recréons
		// les éléments de l'élément to-do, en appelant:
		// this.show[All|Active|Completed]();
		if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
			this['show' + activeRoute]();
		}

		this._lastActiveRoute = activeRoute;
	};

	/**
	 * Met à jour le statut sélectionné de la navigation du filtre.
	 * @param {string} (currentPage) '' || active || completed La route de la page actuelle.
	 */
	Controller.prototype._updateFilterState = function (currentPage) {
		// Stockez une référence à la route active, ce qui nous permet de filtrer à nouveau
		// les éléments de tâche tels qu'ils sont marqués comme complets ou incomplets.
		this._activeRoute = currentPage;

		if (currentPage === '') {
			this._activeRoute = 'All';
		}

		this._filter();

		this.view.render('setFilter', currentPage);
	};

	// Exporte vers Window.
	window.app = window.app || {};
	window.app.Controller = Controller;
})(window);