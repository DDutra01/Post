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
const user = require ('./routes/userRouter')
//auth
const passport = require('passport')
require('./config/auth')(passport)


// #Configurações: 
//session:
app.use(session({
    secret: "classNode",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


app.use(flash())
//MIDDLEWARE: 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.err_msg = req.flash("err_msg")
    res.locals.error = req.flash('error')
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

/* ##### categorias */
app.get('/categorias',(req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('categorias/index', {categorias :categorias })
    }).catch((err) => {
        req.flash('err_msg','error ao lsitar as categorias')
        res.render('/')
    })
})
/* #### post por categoria */
app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if (categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                res.render('categorias/postagensCat', {postagens:postagens,categoria: categoria})
            }).catch((err) =>{
                req.flash('err_msg','Erro in find post!!')
                req.redirect('/')
            })
        }else{
            req.flash('err_msg', 'this categoria is not found or no exists')
            res.render('/categorias')
        }

    }).catch((err) => {
        req.flash('err_msg','error in search categoria')
        res.redirect('/')
    })
})



app.use('/admin', admin)
app.use('/user', user)




// #Outros:
const PORT = 4001
app.listen(PORT, () => {
    console.log('>>>> Servidor started ....')
})

