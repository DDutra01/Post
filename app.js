// carregando modulos 
const express = require ('express')
const {engine} = require ('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require ('mongoose')
const app = express()
const admin = require ('./routes/admin')
const path = require ('path') //dependecia do node, para trabalhar com pastas
const session = require("express-session")
const flash = require ("connect-flash")

// #Configurações: 
    //session:
        app.use(session({
            secret: "classNode",
            resave: true,
        saveUninitialized:true
            }))
        app.use(flash())
    //MIDDLEWARE: 
     app.use((req,res,next)=>{
       res.locals.success_msg = req.flash("success_msg")
       res.locals.err_msg = req.flash("err_msg")
        next()
    })

    //Body Parser: 
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //Handlebars: 
        app.engine('handlebars', engine())
        app.set('view engine','handlebars')
    //Mongoose:
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/firstMongo").then(()=>{
            console.log('>>>> Database connected ...:')
        }).catch((err)=>{
            console.log("## Erro in connection ...:")
        })

    //Public:
        app.use(express.static(path.join(__dirname,"public")))

   


// #Rotas:
    app.get('/', (req,res)=>{
        res.render('index')
    })
    app.use('/admin', admin)





// #Outros:
const PORT = 4001
app.listen(PORT, () => {
    console.log('>>>> Servidor started ....')
})

