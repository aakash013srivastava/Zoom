const express =require("express")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bodyParser= require("body-parser")
const fs = require('fs')
var bcrypt = require('bcrypt');
const saltRounds = 10;
app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());
app.set('view engine','ejs')
app.set('views','./views')

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.get('/',(req,res)=>{
    
    res.render("index.ejs",{user_id:req.session.user_id})
})

app.get('/register',(req,res)=>{
    res.render("register.ejs",{user_id:null})
})

app.post('/register',(req,res)=>{
    const email = req.body.email
    const password = req.body.password
    let flag = false
    fs.readFile('users.txt','utf-8',(err,data)=>{
        if(data){
            const lines = data.split('\n')
            for(let x =0;x<lines.length;x++){
                const user = (lines[x]).split(',')
                const cur_user = (user[0])
                cur_email = cur_user.substring(6,cur_user.length);
                
                if(email == cur_email){
                    flag = true
                }
            }
            

        }
    })
    if(!flag){
        const passwordHash = bcrypt.hashSync(password, 10);
        fs.appendFile('users.txt',`email:${email},password:${passwordHash}\n`,(err,file)=>{
            if(err)
            res.send("User not Created")
            else
            res.redirect('/login')
        })
    }else{
        res.send("User already exists")
    }
})


app.get('/about',(req,res)=>{
    res.render("about.ejs",{user_id:req.session.user_id})
})

app.get('/login',(req,res)=>{
    res.render('login.ejs',{user_id:req.session.user_id})
})


app.post('/login',(req,res)=>{
    const email = req.body.email
    const password = req.body.password
    let flag = false
    fs.readFile('users.txt','utf-8',(err,data)=>{
        if(data){
            const lines = data.split('\n')
            
            for(let x =0;x<lines.length;x++){
                if(lines[x]){
                    
                    const user = (lines[x]).split(',')
                    const cur_user = (user[0])
                    cur_email = cur_user.substring(6,cur_user.length);
                    const cur_pass = (user[1])
                    cur_password = cur_pass.substring(9,cur_pass.length);
                    const verified = bcrypt.compareSync(password, cur_password);
                    if(email == cur_email && verified){
                        
                        flag = true
                        console.log("found");
                    }
                }
            }
            

        }
    })
    if(!flag){
        req.session.user_id = email
        console.log(req.session.user_id);
        res.render('index.ejs',{user_id:email})
    }else{

        res.redirect("/register")
    }
})


app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect("/")
})



app.listen(3000)
