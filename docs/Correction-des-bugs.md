## Etape 1: Corrigez les bugs  
### Les erreurs identifiées et corrigées dans les différents fichiers:
* Bug 1 dans le fichier [controller.js](../js/controller.js), ligne 97:  
Faute de frappe dans le nom d'une méthode: `adddItem` au lieu de `addItem`.  

```js
Controller.prototype.addItem = function (title) { // Step 1: corrected bug 1 = typing error
  let self = this;
    
  if (title.trim() === '') {
      return;
  }
    
  self.model.create(title, function () {
    self.view.render('clearNewTodo');
    self._filter(true);
  });
};
```

* Bug 2 dans le fichier [store.js](../js/store.js), ligne 85:  
Utilisation de la méthode `getTime()` pour éviter les conflits éventuels entre 2 IDs identiques.  

```js
// Fixed bug 2 = possible conflict between two identical IDs
// Generate ID
let newId = (new Date().getTime());
console.log(newId);
let charset = "0123456789";

for (let i = 0; i < 6; i++) {
  newId += charset.charAt(Math.floor(Math.random() * charset.length));
}
```

* Bug 3 dans le fichier [index.html](../index.html), ligne 16:  
Ajout de l'ID manquant `toggle-all` dans l'input.  

```html
<section class="main">
  <!-- Adding the missing ID on the input -->
  <input id="toggle-all" class="toggle-all" type="checkbox">
  <label for="toggle-all">Mark all as complete</label>
  <ul class="todo-list"></ul>
</section>
```

### Les améliorations effectuées dans le code:  
* Fichier [view.js](../js/view.js), ligne 263:  
Remplacement des instructions `if / else if` par une instruction `Switch` plus adaptée pour une comparaison à une liste de valeurs attendues.  
```js
View.prototype.bind = function (event, handler) {
  let self = this;
  // Replacement if / else if with a switch
  switch (event) {
    case "newTodo":...
    case "removeCompleted":...
    case "toggleAll":...
    case "itemEdit":...
    case "itemRemove":...
    case "itemToggle":...
    case "itemEditDone":...
    case "itemEditCancel":...
    default:...
  }
};
```
* Fichier [controller.js](../js/controller.js), ligne 126:  
Remplacement des 2 boucles While par une expression régulière (RegExp).  
```js
Controller.prototype.editItemSave = function (id, title) {
  let self = this;

  // Replacement of the 2 while loops below by a regular expression (RegExp)
  title = title.replace(/^\s+|\s+$/g, '');

  /*
  while (title[0] === " ") {
    title = title.slice(1);
  }

  while (title[title.length-1] === " ") {
    title = title.slice(0, -1);
  }
  */

  if (title.length !== 0) {
    self.model.update(id, {title: title}, function () {
      self.view.render('editItemDone', {id: id, title: title});
    });
  } else {
    self.removeItem(id);
  }
};
```
* Fichier [controller.js](../js/controller.js), ligne 169:  
Suppression d’une boucle forEach utilisée uniquement pour afficher des données en console:  
```js
Controller.prototype.removeItem = function (id) {
  let self = this;

  // Removal of the unnecessary forEach loop, used only for a console display.
  /*
  let items;
  self.model.read(function(data) {
    items = data;
  });

  items.forEach(function(item) {
    if (item.id === id) {
      console.log("Element with ID: " + id + " has been removed.");
    }
  });
  */

  self.model.remove(id, function () {
    self.view.render('removeItem', id);
  });

  self._filter();
};
```
* Fichier [store.js](../js/store.js), ligne 124:  
Regroupement des 2 boucles for.  
```js
Store.prototype.remove = function (id, callback) {
  let data = JSON.parse(localStorage[this._dbName]);
  let todos = data.todos;
  let todoId;

  // Grouping and optimization of the 2 old for loops.
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].id === id) {
      todoId = todos[i].id;
    }
    if (todos[i].id === todoId) {
      todos.splice(i, 1);
    }
  }

  localStorage[this._dbName] = JSON.stringify(data);
  callback.call(this, todos);
};
```
