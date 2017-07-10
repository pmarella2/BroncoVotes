const http = require('http')

var express = require('express')
var paillier = require('jspaillier')
var jsbn = require('jsbn')
var body = require('body-parser')
require('datejs')

var app = express()

var keys = paillier.generateKeys(128)

const hostname = '127.0.0.1'
const port = 3000

app.get('/', function(req, res) {
    res.send('BroncoVotes: Backend Server')
})

app.listen(port, function(res) {
    console.log('BroncoVotes: Backend Server Listening on Port ' + port)
})

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
})

app.get('/encrypt/:id', function(req, res) {
    var ekey = req.params.id
    ekey = keys.pub.encrypt(keys.pub.convertToBn(ekey)).toString()
    res.send(ekey)
})

app.get('/decrypt/:id', function(req, res) {
    var dkey = req.params.id
    dkey = keys.sec.decrypt(keys.pub.convertToBn(dkey)).toString()
    res.send(dkey)
})

app.get('/add/:id/:id2', function(req, res) {
    var ein1 = req.params.id
    var ein2 = req.params.id2
    eadd = keys.pub.add(keys.pub.convertToBn(ein1), keys.pub.convertToBn(ein2)).toString()
    res.send(eadd)
})

app.get('/getTime', function(req, res) {
    var timestamp = Math.round((new Date()).getTime() / 1000)
    res.send("" + timestamp)
})
