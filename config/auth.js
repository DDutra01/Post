const localStrategy = require('passport-local').Strategy
const passport = require('passport')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Model user
require('../models/User')
const User = mongoose.model('user')

module.exports = function(passport){
    //campo usado para autenticação.
    passport.use(new localStrategy({usernameField:'email'},(email,password,done) =>{


        User.findOne({email:email}).then((user)=>{
            if(!user){
                return done(null, false, {menssage: 'esta conta não existe!!'})
                // funcção que retorna os dados da auth, ser deu certo (false), e uma msg
            }

            //comparando a senha(hash)

            bcrypt.compare(password,user.password,(error, batem) =>{
                
                if(batem){
                    return done(null, user)
                }else{
                    return done (null, false, {message : 'senha inválida'})
                }

            })

        })

    }))

      
    //armazena os dados do ususário logado
    passport.serializeUser((user, done) =>{
       done(null, user.id)
    })
    
    passport.deserializeUser((id,done) => {
        User.findById(id,(error,user)=>{
            done(error,user)
        })
    })
   
  



}

