const express = require('express')
const { route } = require('express/lib/application')
const router = express.Router()
// para usar um model de fora para adicionar dados dentro do banco de dados.
const mongoose = require('mongoose')
//buscando os posts do banco:
require('../models/Categoria')
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

router.get('/', (req, res) => {
    res.render('admin/index')
})


//############################ ROTA DAS POSTAGENS:
router.get('/postagens', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ data: 'desc' }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash("err_msg", "## error in list")
        res.redirect('admin/postagens')
    })

})
//===============CREAT POST
router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categoria) => {
        res.render('admin/addPostagens', { categoria: categoria })
    }).catch((err) => {
        req.flash('err_msg', "## erro postagens!!")
        res.render('/admin')
    })

})
router.post('/postagens/new', (req, res) => {
    // validação:
    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "invalide title" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "invalide slug " })
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "invalide description" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: 'invalid conteudo' })
    }
    if (req.body.categoria == '0') {
        erros.push({ texto: "categoria inválida, selecione uma categoria!" })
    }
    if (erros.length > 0) {
        res.render("admin/addPostagens", { erros: erros })
    } else {
        const newPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(newPostagem).save().then(() => {
            req.flash("success_msg", "Post salved!!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("err_msg", "## falied add new post!!!")
            res.render("admin/postagens")
        })
    }



})
//========================UPDATE POST
//obtendo o id da postagem a ser editada. 
router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().sort({ data: 'desc' }).then((postagens) => {
        Categoria.find().lean().then((categoria) => {
            res.render('admin/editPost', { categoria: categoria, postagens: postagens })
        }).catch((err) => {
            req.flash('err_msg', '## erro in edit post busca')
            res.render('admin/postagens')
        })
    }).catch((err) => {
        req.flash('err_msg', '## erro in edit post')
        res.render('admin/postagens')
    })
})
//enviando o update.
router.post('/postagens/edit', (req, res) => {
    //VALIDAÇÃO:

    var erros = []

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "invalide title" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "invalide slug " })
    }

    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "invalide description" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: 'invalid conteudo' })
    }
    if (req.body.categoria == '0') {
        erros.push({ texto: "categoria inválida, selecione uma categoria!" })
    }
    if (erros.length > 0) {
        res.render("admin/addPostagens", { erros: erros })
    } else {
        Postagem.findOne({ _id: req.body.id }).then((postagens) => {
            postagens.titulo = req.body.titulo,
                postagens.slug = req.body.slug,
                postagens.descricao = req.body.descricao,
                postagens.conteudo = req.body.conteudo,
                postagens.categoria = req.body.categoria

            postagens.save().then(() => {
                req.flash('success_msg', 'Update post success!!')
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('err_msg', '##Erro in update post')
                res.redirect('admin/postagens/add')
            })
        })
    }
})


//######################### DELETE POST

router.post('/postagens/delete/:id', (req, res) => {
    Postagem.findOneAndDelete({ _id: req.body.id }).then(() => {
        req.flash('success_msg', 'post deleted !')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('err_msg', 'Error in delete post')
        res.redirect('/admin/postagens')
    })
})



//################################## ADMIN ########################

router.get('/categoria', (req, res) => {
    // buscando no bd todos as cat, lendo, organizando pela data de criação (sort({}))
    Categoria.find().lean().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categoria', { categorias: categorias })
    }).catch((err) => {
        req.flash("err_msg", "## error in list", err)
        res.redirect("/admin")

    })

})
//CREAT POST
router.get('/categoria/add', (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categoria/new', (req, res) => {
    // validação do formulário. 
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "numero de caracter invalido" })
    }

    if (erros.length > 0) {

        res.render("admin/addcategoria", { erros: erros })
    } else {
        const newCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(newCategoria).save().then(() => {
            req.flash("success_msg", "saved with success!")
            res.redirect("/admin/categoria")
        }).catch((err) => {
            req.flash("err_msg", "## error in the save")
            res.render('/admin/categoria')
        })

    }


})

//==================== UPDATE CATEGORIA
router.get("/categoria/edit/:id", (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render("admin/editCategoria", { categoria: categoria })
    }).catch((err) => {
        req.flash("err_msg", "## error in the find ID")
        res.render("/admin/categorias")
    })

})

router.post('/categoria/edit', (req, res) => {
    //valor que vem da pagina html,
    //validação: 
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "numero de caracter invalido" })
    }

    if (erros.length > 0) {
        res.render("admin/editCategoria", { erros: erros })
    } else {

        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome //update dos valores
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "saved with success!")
                res.redirect("/admin/categoria")
            }).catch((err) => {
                req.flash("err_msg", "## Erro edit post")
                res.redirect("admin/categorias/edit")
            })
        }).catch((err) => {
            req.flash("err_msg", "## Erro edit post")
            res.redirect("admin/categorias")
        })

    }
})
// DELETE CATEGORIA

router.post('/categoria/delete/:id', (req, res) => {
    Categoria.findOneAndDelete({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "deleted with success!")
        res.redirect("/admin/categoria")
    }).catch((err) => {
        req.flash("err_msg", "## Erro delete post")
        res.redirect("admin/categoria")
    })

});


module.exports = router // você deve exportar as rotas para poder chamar em outro arquivo. 
