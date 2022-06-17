const express =require("express")
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bodyParser= require("body-parser")
const fs = require('fs')
let bcrypt = require('bcrypt');
let multer = require('multer');
const { request } = require("http");

let storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./static/uploads/')
    },
    filename:function(req,file,cb){
        cb(null,req.session.user_id+"_"+Date.now()+"_"+file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/jpg'||file.mimetype==='image/png'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

let upload = multer({
    storage:storage,
    fileFilter:fileFilter
})

const saltRounds = 10;
app = express()





// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());
// Set view engine as ejs
app.set('view engine','ejs')

// Set views directory as views
app.set('views','./views')


// Register sessions functionality
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.get('/',(req,res)=>{
    fs.readFile('listings.txt','utf-8',(err,data)=>{
        const lines = data.split('\n')

        res.render("index.ejs",{user_id:req.session.user_id,listings:lines})
    })
})



app.get('/query',(req,res)=>{
    // fs.readFile
    console.log(req.body.hidden);
    res.render("query.ejs",{user_id:req.session.user_id,query:req.body.hidden})
})

app.post('/query',(req,res)=>{
    console.log(req.body.query_item);
    res.render('thanks.ejs',{user_id:req.session.user_id})
})

app.get('/register',(req,res)=>{

    res.render("register.ejs",{user_id:null})
})

// Register a new user

app.post('/register',(req,res)=>{
    const email = req.body.email
    const password = req.body.password
    let flag = false

    // check if user not already present
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

    // if user is not present in db
    if(flag){
        //create hash of user password
        const passwordHash = bcrypt.hashSync(password, 10);

        // Add user to db
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

    // check if user i  present in the user db
    fs.readFile('users.txt','utf-8',(err,data)=>{
        if(data){
            const lines = data.split('\n')
            // check if user present in users db line by line
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
        // res.render('index.ejs',{user_id:req.session.user_id})
        res.redirect('/')
    }else{

        res.redirect("/register")
    }
})


app.get('/logout',(req,res)=>{
    req.session.destroy()
    res.redirect("/")
})


app.get('/add_car',(req,res)=>{
    res.render('add_car.ejs',{user_id:req.session.user_id})
})


app.post('/add_car',(req,res)=>{
    
    const model = req.body.model
    const company = req.body.companies
    const year = req.body.year

    fs.appendFile('listings.txt',`${model}-${company}-${year}:${req.session.user_id}`+"\n",(err,data)=>{
        if(err){
            console.log(err);
        }else{
            console.log(data);
        }
    })
})



app.listen(3000)
