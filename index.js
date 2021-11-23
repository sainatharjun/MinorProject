const express = require('express');
const path = require('path'); // required for absolute path while rendering html pages
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(express.static("public"));
//app.use(express.static("public/scripts"));
//app.use('./modeler');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) ;
app.use(session({secret: 'ssshhhhh'})); // secret is necessary for managing sessions

let createAsset = require('./modeler/createAsset');
let transferAsset = require('./modeler/transferAsset');
let login = require('./modeler/login');
let register = require('./modeler/register');
let get_assets=require('./modeler/get_assets')
let payToken=require('./modeler/payToken')
// do url routing
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public/registration.html'));
});

app.post('/createAsset',(req,res)=>{
    createAsset.createAsset(req,res);
});

app.post('/transferAsset',(req,res)=>{
    transferAsset.transferAsset(req,res);
});

app.post('/login',(req,res)=>{
    //const s = req.session;
    login.login(req,res);
})
app.post('/register',(req,res)=>{
    //const s = req.session;
    register.register(req,res);
})
app.post('/payToken',(req,res)=>{
    //const s = req.session;
    payToken.payToken(req,res);
})
app.get('/get_assets',(req,res)=>{
    //const s = req.session;
    get_assets.get_assets(req,res);
})

// listen @ 3000
app.listen(3000,()=>{
    console.log('Listening at port 3000');
});


/*
inside any function, create a variable say 'sess' and assign it as req.session;
this sess is an object like our $_SESSION variable in php
we can set the name like:
    sess.name = 'Kaushik'; // this is same as $_SESSION['name'] = 'Kaushik';
*/
