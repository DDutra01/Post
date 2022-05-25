// carregando modulos 
const express = require('express')
const { engine } = require('express-handlebars')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin')
const path = require('path') //dependecia do node, para trabalhar com pastas
const session = require("express-session")
const flash = require("connect-flash")
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model("categorias")

// #Configurações: 
//session:
app.use(session({
    secret: "classNode",
    resave: true,
    saveUninitialized: true
}))
app.use(flash())
//MIDDLEWARE: 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.err_msg = req.flash("err_msg")
    next()
})

//Body Parser: 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//Handlebars: 
app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
//Mongoose:
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/firstMongo").then(() => {
    console.log('>>>> Database connected ...:')
}).catch((err) => {
    console.log("## Erro in connection ...:")
})

//Public:
app.use(express.static(path.join(__dirname, "public")))




// #Rotas:
app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: 'desc' }).then((postagens) => {
        res.render('index', { postagens: postagens })
    }).catch((err) => {
        req.flash('err_msg', 'Error in list the post')
        res.redirect('/404')
    })

})


app.get("/postagem/:slug",(req,res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) =>{
        if (postagem){
            res.render('postagem/index', {postagem:postagem})
        }else{
            req.flash('err_msg','Esta postagem não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('err_msg', "erro na busca")
        res.redirect('/')
    })

})

app.get('/404', (req, res) => {
    res.send('Error 404!')
})

/* nãop esta listando as categorias!! */
app.get('/categorias',(req,res) => {
    Categoria.find().then((categorias) => {
        res.render('categorias/index', {categorias :categorias })
    }).catch((err) => {
        req.flash('err_msg','error ao lsitar as categorias')
        res.render('/')
    })
})

app.use('/admin', admin)




// #Outros:
const PORT = 4001
app.listen(PORT, () => {
    console.log('>>>> Servidor started ....')
})

