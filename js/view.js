/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	 * La fonction view permet deux types d’actions :
	 * - attacher un évènement d'une tâche donnée avec un gestionnaire d'évènement (bind) et
	 * - faire le rendu d'une commande avec ses options (render).
	 * Définit le template à utiliser et prépare les éléments à cibler via les classes CSS.
	 */
	function View(template) {
		this.template = template;

		this.ENTER_KEY = 13;
		this.ESCAPE_KEY = 27;

		this.$todoList = qs('.todo-list');
		this.$todoItemCounter = qs('.todo-count');
		this.$clearCompleted = qs('.clear-completed');
		this.$main = qs('.main');
		this.$footer = qs('.footer');
		this.$toggleAll = qs('.toggle-all');
		this.$newTodo = qs('.new-todo');
	}

	/**
	 * Supprime l’élément contenant une entrée.
	 * @param {number} (id) L'ID de l'élement à supprimer.
	 * @private
	 */
	View.prototype._removeItem = function (id) {
		let elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Affiche ou cache le bouton « Clear completed ».
	 * @param {number} (completedCount) Le nombre de to-dos cochés.
	 * @param {boolean} (visible) True si visible, false sinon.
	 * @private
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * Indique la page actuelle.
	 * @param {string} (currentPage) Qui peut être '' || active || completed
	 * @private
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Barre une entrée si elle a la classe « .completed », et enlève la barre sinon.
	 * @param {number} (id) L'ID de l'élément.
	 * @param {boolean} (completed) Le statut de l'élément.
	 * @private
	 */
	View.prototype._elementComplete = function (id, completed) {
		let listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = completed ? 'completed' : '';

		// Au cas où il a été basculé à partir d'un événement et non en cliquant sur la chackbox.
		qs('input', listItem).checked = completed;
	};

	/**
	 * Permet l' édition d'un élément.
	 * @param {number} (id) L'ID de l'élément.
	 * @param {string} (title) Le contenu du to-do.
	 * @private
	 */
	View.prototype._editItem = function (id, title) {
		let listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		listItem.className = listItem.className + ' editing';

		let input = document.createElement('input');
		input.className = 'edit';

		listItem.appendChild(input);
		input.focus();
		input.value = title;
	};

	/**
	 * Retourne à l’affichage initial d’une entrée qui vient d’être modifiée.
	 * @param {number} (id) L'ID tu to-do.
	 * @param {string} (title) Le contenu du to-do.
	 * @private
	 */
	View.prototype._editItemDone = function (id, title) {
		let listItem = qs('[data-id="' + id + '"]');

		if (!listItem) {
			return;
		}

		let input = qs('input.edit', listItem);
		listItem.removeChild(input);

		listItem.className = listItem.className.replace('editing', '');

		qsa('label', listItem).forEach(function (label) {
			label.textContent = title;
		});
	};

	/**
	 * lance une des fonctions d’affichage selon la commande en paramètre.
	 * @param {string} (viewCmd) La fonction active.
	 * @param {object} (parameter)
	 */
	View.prototype.render = function (viewCmd, parameter) {
		let self = this;
		let viewCommands = {
			// Affiche les todos.
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			// Supprime un to-do.
			removeItem: function () {
				self._removeItem(parameter);
			},
			//  Met à jour le nombre de todos.
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			//  Mets à jour le bouton Clear completed.
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			// Affiche ou masque le "footer" de la to-do-list.
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			// Marque tous les éléments comme "Completed".
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			// Gère l'affichage des filtres (url).
			setFilter: function () {
				self._setFilter(parameter);
			},
			// Vide le champ texte principal de la to-do-list après création.
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			// Gère l'affichage pour l'ajout d'un nouveau to-do.
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			// Gère l'affichage d'un to-do en cours de modification.
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			// Gère l'affichage d'un to-do dont la modification vient d'être terminée.
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * Récupère l'ID d'un to-do.
	 * @param {object} (element) L'élément actif.
	 * @returns {number} L'ID de l'élément.
	 * @private
	 */
	View.prototype._itemId = function (element) {
		let li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * Gère l'affichage lors de la perte de focus du to-do en cours d'édition.
	 * @param {function} (handler) Un callback exécuté sous condition.
	 * @private
	 */
	View.prototype._bindItemEditDone = function (handler) {
		let self = this;
		$delegate(self.$todoList, 'li .edit', 'blur', function () {
			if (!this.dataset.iscanceled) {
				handler({
					id: self._itemId(this),
					title: this.value
				});
			}
		});

		$delegate(self.$todoList, 'li .edit', 'keypress', function (event) {
			if (event.keyCode === self.ENTER_KEY) {
				// Retire le curseur de l'input lorsque l'on appuie sur entrée.
				this.blur();
			}
		});
	};

	/**
	 * Gère l'affichage du to-do dont la modification est annulée.
	 * @param {function} (handler) Un callback exécuté sous condition.
	 * @private
	 */
	View.prototype._bindItemEditCancel = function (handler) {
		let self = this;
		$delegate(self.$todoList, 'li .edit', 'keyup', function (event) {
			if (event.keyCode === self.ESCAPE_KEY) {
				this.dataset.iscanceled = true;
				this.blur();

				handler({id: self._itemId(this)});
			}
		});
	};

	/**
	 * Gestionnaire d’évènements qui permet d’effectuer un rendu particulier en
	 * fonction des actions réalisées par l’utilisateur.
	 * @param {function} (event) Le type d'évenement.
	 * @param {function} (handler) La fonction de callback associée.
	 */
	View.prototype.bind = function (event, handler) {
		let self = this;
		if (event === 'newTodo') {
			$on(self.$newTodo, 'change', function () {
				handler(self.$newTodo.value);
			});

		} else if (event === 'removeCompleted') {
			$on(self.$clearCompleted, 'click', function () {
				handler();
			});

		} else if (event === 'toggleAll') {
			$on(self.$toggleAll, 'click', function () {
				handler({completed: this.checked});
			});

		} else if (event === 'itemEdit') {
			$delegate(self.$todoList, 'li label', 'dblclick', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemRemove') {
			$delegate(self.$todoList, '.destroy', 'click', function () {
				handler({id: self._itemId(this)});
			});

		} else if (event === 'itemToggle') {
			$delegate(self.$todoList, '.toggle', 'click', function () {
				handler({
					id: self._itemId(this),
					completed: this.checked
				});
			});

		} else if (event === 'itemEditDone') {
			self._bindItemEditDone(handler);

		} else if (event === 'itemEditCancel') {
			self._bindItemEditCancel(handler);
		}
	};

	// Exporte vers Window.
	window.app = window.app || {};
	window.app.View = View;
}(window));
