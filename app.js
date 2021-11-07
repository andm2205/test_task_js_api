const PORT = process.env.PORT ?? 3003

const express = require('express')
const app = express()
const bp = require('body-parser');
const mysql = require('mysql')

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
    password: '2124',
    port: 3306
}

app.post('/api/create.product', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try {
        const product = req.body
        if(!(product.name 
            && product.price 
            && product.userId 
            && product.statusCode))
            throw new Error("param cannot be null")
        if(product.price < 0)
            throw new Error("price cannot be < 0");
        connection.connect()
        connection.query(
            `insert into products (name, price, user_id, status_code) 
            values (?, ?, ?, ?)`, 
            [product.name, product.price, product.userId, product.statusCode],
            function(err, results) {
                if(err)
                    res.status(500).send(err)
                else
                    res.sendStatus(201)
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.put('/api/update.product', function (req, res) {
    var connection = mysql.createConnection(connectionParams)
    try {
        const product = req.body
        if(!(product.name
            && product.price
            && product.userId
            && product.statusCode
            && product.id))
            throw new Error("param cannot be null")
        if(product.price < 0)
            throw new Error("price cannot be < 0")
        if(product.statusCode >= 3 && product.statusCode <= 4)
            throw new Error("status code is not valid")
        connection.connect()
        connection.query(
            `select * from products 
            where id = ?`,
            [product.id],
            function(err, results) {
                try {
                    if(err)
                        res.status(500).send(err)
                    else if(results.length === 0)
                        throw new Error('product not found')
                    else if(results[0].status_code >= 3 && results[0].status_code <= 4)
                        throw new Error('product is sold or deleted')
                    else if(product.userId !== results[0].user_id)
                        throw new Error('access to user denied')
                    connection.query(
                        `update products
                        set name = ?,
                        price = ?,
                        status_code = ?
                        where id = ?`,
                        [product.name, product.price, product.statusCode, product.id],
                        function(err, results) {
                            if(err)
                                res.status(500).send(err)
                            else
                                res.sendStatus(202)
                        })
                } catch (error) {
                    res.status(500).send({message: error.message})
                }
            })
    } catch (error) {
        console.log(error)
        res.status(500).send({message: error.message})
    }
})


app.delete('/api/delete.product', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try {
        const product = req.body
        if(product.id == null)
            throw new Error("param cannot be null");
        connection.connect()
        connection.query(
            `select * from products
            where id = ?`,
            [product.id],
            function(err, results) {
                try {
                    if(err)
                        res.status(500).send(err)
                    else if(results.length === 0)
                        throw new Error('product not found')
                    else if(results[0].status_code === 4)
                        throw new Error('product is deleted')
                    else if(product.userId !== results[0].user_id)
                        throw new Error('access to user denied')
                    else connection.query(
                        `delete from products
                        where id = ?`,
                        [product.id],
                        function(err, results) {
                            if(err)
                                res.status(500).send(err)
                            else
                                res.sendStatus(200)
                        })
                } catch (error) {
                    res.status(500).send({message: error.message})
                }
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.put('/api/buy.product', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try
    {
        const product = req.body
        if(product == null)
            throw new Error("param cannot be null")
        connection.connect()
        connection.query(
            `select * from products
            where id = ?`,
            [product.id],
             function(err, results) {
                try {
                    if(err)
                        res.status(500).send(err)
                    else if(results.length === 0)
                        throw new Error('product not found')
                    else if(results[0].user_id === product.userId)
                        throw new Error('this user is owner of product')
                    else if(results[0].status_code != 1)
                        throw new Error('product is not active')
                    else connection.query(
                        `update products
                        set status_code = 3
                        where id = ?`,
                        [product.id],
                        function(err, results) {
                            if(err)
                                res.status(500).send(err)
                            else
                                res.sendStatus(202);
                        })
                } catch (error) {
                    res.status(500).send({message: error.message})
                }
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.get('/api/get.product/:id', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try
    {
        var productId = req.params.id
        if(productId == null)
            throw new Error("param cannot be null")
        connection.connect()
        connection.query(
            `select * from products where id = ?`,
            [productId],
            function(err, results) {
                if(err)
                    res.status(500).send(err)
                else if(results.length > 0)
                    res.status(200).json(results)
                else
                    res.sendStatus(204)
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

app.get('/api/get.products', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try {
        connection.connect()
        connection.query(
            `select * from products`,
            function(err, results) {
                if(err)
                    res.status(500).send(err)
                else
                    res.status(200).json(results)
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})
 
app.get('/api/get.activeProducts/:userId', function (req, res) {
    const connection = mysql.createConnection(connectionParams)
    try {
        const userId = req.params.userId
        connection.connect()
        connection.query(
            `select * from products
            where status_code = 1 and user_id = ?`,
            [userId],
            function(err, results) {
                if(err)
                    res.status(500).send(err)
                else if(results.length > 0)
                    res.status(200).json(results)
                else
                    res.status(204).json(results)
            })
    } catch (error) {
        res.status(500).send({message: error.message})
    }
})

var server = app.listen(PORT, function () {
    var address = server.address().address ===  "::" 
    ? "127.0.0.1" 
    : server.address().address;
    var port = server.address().port;
    console.log(`http://${address}:${port}`)
});