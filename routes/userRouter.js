const express = require('express')
const { append } = require('express/lib/response')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('user')
const bcryptjs = require ('bcryptjs')

/* creat user */
router.get('/registro', (req, res) => {
    res.render('user/registro')
})

router.post('/registro', (req, res) => {
    /* validação do cadastro */
    var erros = []

    if (!req.body.nome || req.body.nome == undefined ||
        req.body.nome == null || req.body.email.length < 5) {
        erros.push({ texto: 'Nome inválido!!' })
    }
    if (!req.body.email || req.body.email == undefined ||
        req.body.email == null || req.body.email.length < 5) {
        erros.push({ texto: 'Email inválido!!' })
    }
    if (!req.body.senha || req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: 'Nome inválido!!' })
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: 'senha muito pequena' })
    }
    if (req.body.senha != req.body.senhadois) {
        erros.push({ texto: 'senhas não são iguais' })
    }
    if (erros.length > 0) {
        res.render('user/registro', { erros: erros })
    } else {
        //vÊ se tem cadastro:
        User.findOne({ email: req.body.email }).then((user) => {
            if (user) {
                req.flash('err_msg', ' email já utilizado, tente outro!')
                res.render('user/registro')
            } else {
                //creat user

                var salt = bcryptjs.genSaltSync(10);
                var hash = bcryptjs.hashSync(req.body.senha, salt);


                const newUser = {
                    nome: req.body.nome,
                    email: req.body.email,
                    password: hash
                }
                
                new User(newUser).save().then(() =>{
                    req.flash('success_msg','user salved')
                    res.render('user/registro')
                }).catch((err) => {
                    req.flash('err_msg','Falied user!!')
                    res.redirect('user/registro')
                })               

            }
        }).catch((err) => {
            req.flash('err_msg', 'Erro na pesquisa')
            res.redirect('/')
        })

        /* NÃO TA SALVANDO OS USUARIOS */



    }
})



module.exports = router