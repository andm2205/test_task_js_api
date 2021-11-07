# API для работы с товарами

## Обзор

API для работы с товарами с помощью HTTP-методов реализует определенный функционал. БД содержит 2 сущности: пользователь и товар. В файле `dbstruct.sql` содержится схема БД для СУБД MySQL. По умолчанию сервер работает на порте 3003. В папке `sample` содержатся примеры использования API.

Измените объект `connectionParams` для правильного подключения к вашей БД.

## Запуск

Для запуска откройте терминал и введите:

`node полный_путь_к_файлу_app.js`

## Методы

### POST `/api/create.product`

Позволяет создать товар

Request body: `{name: string, price: number, userId: number, statusCode: number}`

### PUT `/api/update.product`

Позволяет изменить поля товара (название - `name`, цену - `price`, статус - `status` (активный или неактивный)) по параметру `id`. Пользователь указывается для определения, является ли он владельцем. Нельзя изменять товар если он удален или продан.

Request body: `{name: string, price: number, userId: number, statusCode: number, id: number}`

### DELETE `/api/delete.product`

Позволяет удалить товар (изменить статус на 'Удалён') по параметру `id`

Request body: `{id: number}`

### PUT /api/buy.product

Позволяет купить товар по параметру `id`, т. е. изменяет статус товара на 'Продан'. Владелец не может купить свой товар. Купить можно товар только со статусом 'Активен'.

Request body: `{id: number, userId: number}`

### GET `/api/get.product/:id`

Позволяет получить товар по параметру `id`

Response: `Array [{name: string, price: number, userId: number, statusCode: number, id: number}]`

### GET `/api/get.products`

Позволяет получить все товары

Response: `Array [{name: string, price: number, userId: number, statusCode: number, id: number}]`

### GET `/api/get.activeProducts/:userId`

Позволяет получить все активные товары с ID владельца по параметру `userId`

Response: `Array [{name: string, price: number, userId: number, statusCode: number, id: number}]`