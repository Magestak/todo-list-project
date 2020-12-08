/*global qs, qsa, $on, $parent, $delegate */

(function (window) {
	'use strict';

	/**
	 * View that abstracts away the browser's DOM completely.
	 * It has two simple entry points:
	 *   - bind(eventName, handler)
	 *     Takes a todo application event and registers the handler
	 *   - render(command, parameterObject)
	 *     Renders the given command with the options
	 *
	 * @param {object} (template)
	 * @constructor
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
	 * Will remove an item from the View based on its ID
	 *
	 * @param {number} (id) The ID of the item you want to remove
	 *
	 * @private
	 */
	View.prototype._removeItem = function (id) {
		let elem = qs('[data-id="' + id + '"]');

		if (elem) {
			this.$todoList.removeChild(elem);
		}
	};

	/**
	 * Will toggle the "Clear completed" button.
	 *
	 * @param {number} (completedCount) Number of completed tasks.
	 * @param {boolean} (visible) Is visible or not.
	 *
	 * @private
	 */
	View.prototype._clearCompletedButton = function (completedCount, visible) {
		this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
		this.$clearCompleted.style.display = visible ? 'block' : 'none';
	};

	/**
	 * Update the view according to the selected filter
	 *
	 * @param {string} (currentPage) Value of the current URL route.
	 */
	View.prototype._setFilter = function (currentPage) {
		qs('.filters .selected').className = '';
		qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
	};

	/**
	 * Update the view when a task is completed.
	 *
	 * @param {number} (id) The ID of the selected task.
	 * @param {boolean} (completed) Task is completed or not.
	 *
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
	 * Trigger the edit mode (input field with the current title)
	 *
	 * @param {number} (id) The ID of the selected task.
	 * @param {string} (title) Current task title that will be in the input field.
	 *
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
	 * End the edit mode and display the new value.
	 *
	 * @param {number} (id) The ID of the edited task.
	 * @param {string} (title) New task title.
	 *
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
	 * Update the view according to the command called by Controller.js.
	 *
	 * @param {function} (viewCmd) Command called by Controller.js.
	 * @param {object} (parameter) Parameters of the called function.
	 */
	View.prototype.render = function (viewCmd, parameter) {
		let self = this;
		let viewCommands = {
			// Displays the todos.
			showEntries: function () {
				self.$todoList.innerHTML = self.template.show(parameter);
			},
			// Deletes a todo.
			removeItem: function () {
				self._removeItem(parameter);
			},
			// Updates the number of todos.
			updateElementCount: function () {
				self.$todoItemCounter.innerHTML = self.template.itemCounter(parameter);
			},
			// Updates the Clear completed button.
			clearCompletedButton: function () {
				self._clearCompletedButton(parameter.completed, parameter.visible);
			},
			// Shows or hides the "footer" of the to-do-list.
			contentBlockVisibility: function () {
				self.$main.style.display = self.$footer.style.display = parameter.visible ? 'block' : 'none';
			},
			// Marks all items as "Completed".
			toggleAll: function () {
				self.$toggleAll.checked = parameter.checked;
			},
			// Manages the display of filters (url).
			setFilter: function () {
				self._setFilter(parameter);
			},
			// Empty the main text field of the to-do-list after creation.
			clearNewTodo: function () {
				self.$newTodo.value = '';
			},
			// Manages the display for adding a new to-do.
			elementComplete: function () {
				self._elementComplete(parameter.id, parameter.completed);
			},
			// Manages the display of a to-do being modified.
			editItem: function () {
				self._editItem(parameter.id, parameter.title);
			},
			// Manages the display of a to-do whose modification has just been completed.
			editItemDone: function () {
				self._editItemDone(parameter.id, parameter.title);
			}
		};

		viewCommands[viewCmd]();
	};

	/**
	 * Add the task ID to the targeted element.
	 *
	 * @param {object} (element) Targeted element.
	 *
	 * @private
	 */
	View.prototype._itemId = function (element) {
		let li = $parent(element, 'li');
		return parseInt(li.dataset.id, 10);
	};

	/**
	 * Add events handlers to the edit mode : Enter keyboard press and loosing focus on the edit input field.
	 *
	 * @param {function} (handler) Callback function.
	 *
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
	 * Add events handler that cancel the edit mode when you press the Escape key.
	 *
	 * @param {function} (handler) Callback function.
	 *
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
	 * Bind Controller.js functions to the view.
	 *
	 * @param {function} (event) Event called by Controller.
	 * @param {function} (handler) Callback function.
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

	// Export to window
	window.app = window.app || {};
	window.app.View = View;
}(window));
