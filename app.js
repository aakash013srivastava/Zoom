const express =require("express")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bodyParser= require("body-parser")
const fs = require('fs')
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
    res.render("index.ejs")
})

app.get('/register',(req,res)=>{
    res.render("register.ejs")
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
    if(flag){
        fs.appendFile('users.txt',`email:${email},password:${password}\n`,(err,file)=>{
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
    res.render("about.ejs")
})

app.get('/login',(req,res)=>{
    res.render('login.ejs')
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
                    
                    if(email == cur_email && password==cur_password){
                        
                        flag = true
                        console.log("found");
                    }
                }
            }
            

        }
    })
    if(!flag){
        session = req.session
        session.user_id=req.session.email
        res.redirect('/')
    }else{

        res.redirect("/register")
    }
})


app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect("/")
})



app.listen(3000)
