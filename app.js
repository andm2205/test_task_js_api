const express = require('express')
const path = require('path');
const { stringify } = require('querystring');
const app = express()
const bp = require('body-parser');
const { exception } = require('console');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

const connectionParams = {
    host: 'localhost',
    user: 'root',
    database: 'test_task_db',
    password: '2124'
}

const Statuses = {
    Active: 1, 
    Inactive: 2,
    SoldOut: 3,
    Deleted: 4
}

app.get('/', function (req, res) {res.send("hello")})

app.post('/api/create.product', function (req, res) {
    const product = req.body
    if(product.name == null
        || product.price == null
        || product.userId == null
        || product.statusCode == null)
        throw new IllegalArgumentException("param cannot be null");
    if(product.price < 0)
        throw new IllegalArgumentException("price cannot be < 0");
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `insert into products (name, price, user_id, status_code) 
        values (?, ?, ?, ?)`, 
        [product.name, product.price, product.userId, product.statusCode],
        function(err, results) {
            if(err != null)
                throw err
            res.status(201);
        })
    connection.end()
})

app.put('/api/update.product', function (req, res) {
    const product = req.body
    if(product.name == null
        || product.price == null
        || product.userId == null
        || product.statusCode == null
        || product.id == null)
        throw new IllegalArgumentException("param cannot be null");
    if(product.price < 0)
        throw new IllegalArgumentException("price cannot be < 0");
    if(product.statusCode >= 3 && product.statusCode <= 4)
        throw new IllegalArgumentException("status code is not valid");
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products 
        where id = ?`,
        [product.id],
        function(err, results) {
            if(err != null)
                throw err
            if(results.length === 0)
                throw new exception('product not found')
            if(results[0].status_code >= 3 && results[0].status_code <= 4)
                throw new exception('product is sold or deleted')
            if(product.userId !== results[0].user_id)
                throw new exception('access to user denied')
        })
    connection.query(
        `update products
        set name = ?,
        price = ?,
        status_code = ?
        where id = ?`,
        [product.name, product.price, product.statusCode, product.id],
        function(err, results) {
            if(err != null)
                throw err
            res.status(202)
        })
    connection.end()
})


app.delete('/api/delete.product', function (req, res) {
    const productId = req.body.id
    if(productId == null)
        throw new IllegalArgumentException("param cannot be null");
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products
        where id = ?`,
        [productId],
        function(err, results) {
            if(err != null)
                throw err
            if(results.length === 0)
                throw new exception('product not found')
            if( results[0].status_code === 4)
                throw new exception('product is deleted')
        })
    connection.query(
        `delete from products
        where id = ?`,
        [productId],
        function(err, results) {
            if(err != null)
                throw err
            res.status()
        })
    connection.end()
})

app.put('/api/buy.product', function (req, res) {
    const product = req.body
    if(product == null)
        throw new IllegalArgumentException("param cannot be null");
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products
        where id = ?`,
        [product.id],
        function(err, results) {
            if(err != null)
                throw err
            if(results.length === 0)
                throw new exception('product not found')
            if(results[0].status_code >= 3 && results[0].status_code <= 4)
                throw new exception('product is sold or deleted')
            if(results[0].user_id === product.id)
                throw new exception('this user is owner of product')
            if(results[0].status_code === product.statusCode)
                throw new exception('prosuct is not active')
        })
    connection.query(
        `update products
        set status_code = 3
        where id = ?`,
        [product.id],
        function(err, results) {
            if(err != null)
                throw err
            res.status(202);
        })
    connection.end()
})

app.get('/api/get.product/:id', function (req, res) {
    var productId = req.params.id
    if(productId == null)
        throw new IllegalArgumentException("param cannot be null");
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products where id = ?`,
        [productId],
        function(err, results) {
            if(err != null)
                throw err
            if(results.length > 0)
            {
                console.log(results)
                res.status(200).json(results)
            }
            else
                res.status(204)
        })
    connection.end()
})

app.get('/api/get.products', function (req, res) {
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products`,
        function(err, results) {
            if(err != null)
                throw err
            res.status(200).json(results)
        })
    connection.end()
})
 
app.get('/api/get.activeProducts/:userId', function (req, res) {
    const userId = req.params.userId
    console.log(userId)
    const mysql = require('mysql2')
    const connection = mysql.createConnection(connectionParams)
    connection.query(
        `select * from products
        where status_code = 1 and user_id = ?`,
        [userId],
        function(err, results) {
            if(err != null)
                throw err
            if(results.length > 0)
                res.status(200).json(results)
            else
                res.status(204)
        })
    connection.end()
})

var server = app.listen(3003, function () {
    var address = server.address().address ===  "::" 
    ? "127.0.0.1" 
    : server.address().address;
    var port = server.address().port;
    console.log(`http://${address}:${port}`)
});