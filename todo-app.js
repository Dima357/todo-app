(function () {
    // создаем и возвращем заголовок приложения
    function createAppTitle(title) {
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    // создаем и возвращаем форму для создания тела
    function createTodoItemForm() {
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWraper = document.createElement('div');
        let button = document.createElement('button');

        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название для нового дела';
        buttonWraper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = 'Добавить дело';

        buttonWraper.append(button);
        form.append(input);
        form.append(buttonWraper);

        // Здесь вернем все объекты, потому что нам нужны данные из input, нужно послушать кнопку 
        return {
            form,
            input,
            button
        };
    }

    // создаем и возвращаем список элементов
    function createTodoList() {
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;
    }

    // создаем дело
    function createTodoItem(name, done = false) {
        let item = document.createElement('li');
        // кнопки помещяем в элемент, который красиво покажет их в одной группе
        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');

        // устанавливаем стили для элементов списка, а также для размещения кнопок в правой части (flex)
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        item.textContent = name;

        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = 'Выполнено';
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = 'Удалить';

        if (done === true) {
            item.classList.add('list-group-item-success');
        }

        // вкладываем кнопки в отдельный элемент, чтобы они объединились в один блок
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);

        // приложению нужен доступ к самому элементу и кнопкам, чтобы обрабатывать события нажатия
        return {
            item,
            doneButton,
            deleteButton,
            done
        };
    }

    // обновление локальной памяти
    function actionLocalStorage(WhoItem, itemName, done = false, itemDelete = false, itemUpdate = false, needValidation = false) {
        let saveTodoItem = {};
        saveTodoItem.name = itemName;
        saveTodoItem.done = done;

        // список дел, которые уже есть
        let itemLocalRaw = localStorage.getItem(WhoItem);
        let itemLocalArr = JSON.parse(itemLocalRaw);

        // валидация при добавлении нового дела
        if (needValidation) {
            if (itemLocalArr !== null) {
                for (let itemLocalObj of itemLocalArr) {
                    if (itemLocalObj.name === itemName) {
                        return false;
                    } else {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }

        // сохранение нового элемента
        if (itemDelete === false && itemUpdate === false) {
            if (itemLocalArr === null) {
                let dataBase = [];
                dataBase.push(saveTodoItem);
                localStorage.setItem(WhoItem, JSON.stringify(dataBase));
            } else {
                itemLocalArr.push(saveTodoItem);
                localStorage.setItem(WhoItem, JSON.stringify(itemLocalArr));
            }
        }

        // удаление или обновление элемента
        if (itemUpdate === true || itemDelete === true) {
            for (let itemLocalObj of itemLocalArr) {
                if (itemLocalObj.name === itemName) {
                    let itemIndex = itemLocalArr.indexOf(itemLocalObj);
                    if (itemUpdate === true) {
                        itemLocalArr[itemIndex] = saveTodoItem;
                    } else {
                        itemLocalArr.splice(itemIndex, 1);
                    }
                    localStorage.setItem(WhoItem, JSON.stringify(itemLocalArr));
                }
            }
        }
    }

    function createTodoApp(container, title = 'Список дел', todoItemsBefore = [], WhoItem) {
        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();

        container.append(todoAppTitle);
        container.append(todoItemForm.form); // возвращает объект поэтому забираем конкретно форму
        container.append(todoList);

        // Выгрузим созданные дела
        for (let todoItemBefore of todoItemsBefore) {
            let todoItem = createTodoItem(todoItemBefore.name, todoItemBefore.done);
            todoList.append(todoItem.item);
        }

        // Выгрузим дела которые ранее создали в приложении
        let itemLocalRaw = localStorage.getItem(WhoItem);
        let itemLocalArr = JSON.parse(itemLocalRaw);
        if (itemLocalArr !== null) {
            for (let itemLocalObj of itemLocalArr) {
                let itemLocal = createTodoItem(itemLocalObj.name, itemLocalObj.done);
                todoList.append(itemLocal.item);
            }
        }

        // Сделаем обработчики для кнопок
        let doneButtons = document.querySelectorAll(".btn-success");
        doneButtons.forEach(function (doneButton) {
            doneButton.addEventListener('click', function () {
                let todoItem = doneButton.parentNode.parentNode;
                todoItem.classList.toggle('list-group-item-success');
                if (todoItem.classList.contains('list-group-item-success')) {
                    todoItem.done = true;
                } else {
                    todoItem.done = false;
                }
                actionLocalStorage(WhoItem, todoItem.textContent.slice(0, -16), todoItem.done, false, true);
            });
        });

        let deleteButtons = document.querySelectorAll(".btn-danger");
        deleteButtons.forEach(function (deleteButton) {
            deleteButton.addEventListener('click', function () {
                if (confirm('Вы уверены?')) {
                    let todoItem = deleteButton.parentNode.parentNode;
                    actionLocalStorage(WhoItem, todoItem.textContent.slice(0, -16), todoItem.done, true);
                    todoItem.remove();
                }
            });
        });

        // Дело нельзя создать пока у него нет названия
        todoItemForm.button.disabled = true;

        todoItemForm.input.addEventListener('input', function () {
            if (!todoItemForm.input.value) {
                todoItemForm.button.disabled = true;
            } else {
                todoItemForm.button.disabled = false;
            }
        });

        // браузер создает событие submit на форме по нажатию на Enter или на кнопку создания дела
        todoItemForm.form.addEventListener('submit', function (e) {
            // эта строчка необходима, чтобы предотвратить стандартное действие браузера
            // в данном случае мы не хотим, чтобы страница перезагружалась при отправке формы
            e.preventDefault();

            // игнорируем создание элемента, если пользователь ничего не ввел в поле
            if (!todoItemForm.input.value) {
                return;
            }

            // валидация на проверку такой же записи
            let todoItem;
            let todoItemValidation = actionLocalStorage(WhoItem, todoItemForm.input.value, false, false, false, needValidation = true);

            if (todoItemValidation) {
                todoItem = createTodoItem(todoItemForm.input.value);
            } else {
                alert('Такое дело уже есть!');
                todoItemForm.input.value = '';
                todoItemForm.button.disabled = true;
                return;
            }
            
            // добавляем обработчики на кнопки
            todoItem.doneButton.addEventListener('click', function () {
                todoItem.item.classList.toggle('list-group-item-success');
                if (todoItem.item.classList.contains('list-group-item-success')) {
                    todoItem.done = true;
                } else {
                    todoItem.done = false;
                }
                actionLocalStorage(WhoItem, todoItem.item.textContent.slice(0, -16), todoItem.done, false, true);
            });
            todoItem.deleteButton.addEventListener('click', function () {
                if (confirm('Вы уверены?')) {
                    actionLocalStorage(WhoItem, todoItem.item.textContent.slice(0, -16), todoItem.done, true);
                    todoItem.item.remove();
                }
            });

            // создаем и добавляем в список новое дело с названием из поля для ввода
            todoList.append(todoItem.item);

            // Сохраняем в локальной памяти
            actionLocalStorage(WhoItem, todoItemForm.input.value, todoItem.done);
            // localStorage.clear();

            // обнуляем значение в поле, чтобы не пришлось стирать его в ручную
            todoItemForm.input.value = '';
            todoItemForm.button.disabled = true;
        });
    }

    window.createTodoApp = createTodoApp;
})();