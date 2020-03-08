const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
var mysql = require('mysql');
var url = require("url");
var data = require("fs");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set("view engine", "ejs");
app.use(express.static(__dirname+'/public'));
var con = mysql.createConnection({
    host: "localhost",
    user: "webkriti",
    password: "12345",
    database: "account"
});

var conn = mysql.createConnection({
    host: "localhost",
    user: "webkriti",
    password: "12345",
    database: 'Forum',
  //   port: "3306",
  //   insecureAuterh : true,
  });
con.connect(function (err){
    if (err) throw err;
    console.log("connected");
});

app.get("/forgot-password", function(req, res){
    res.render("ForgotPassword", {
        "heading": "FORGOT PASSWORD",
        "subheading": "USERNAME",
        "input": "user",
        "display": "initial"
    });
});
app.post("/forgot-password/user", urlencodedParser, function(req, res){
    var qdata = {
        user: req.body.user
    };
    var sql = "select * from players where username = '" + qdata.user + "';"
    con.query(sql, function(err, result){
        if (err) throw err;
        if(result.length > 0){
            console.log(result);
            res.render("ForgotPassword", {
                "heading": result[0].username,
                "subheading": result[0].question,
                "input": "ans",
                "display": "initial"
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "USERNAME DOES NOT EXIST",
                "input": "nothing",
                "display": "none"
            });
        }
    });
});

app.post("/forgot-password/ans", urlencodedParser, function(req, res) {
    var qdata = {
        "user": req.body.extra_info,
        "ans": req.body.ans
    }
    var sql = "select * from players where username = '" + qdata.user + "' and ans = aes_encrypt('ans', unhex(sha2('" + qdata.ans + "', 256)));";
    con.query(sql, function(err, result){
        if (err) throw err;
        if(result.length > 0){
            res.render("NewPassword", {
                "username": qdata.user
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "INCORRECT ANSWER",
                "input": "nothing",
                "display": "none"
            });
        }
    })
});

app.post("/change-password", urlencodedParser, function(req, res){
    var qdata = {
        "user": req.body.user,
        "pass": req.body.pass,
        "repass": req.body.repass
    };
    if(qdata.pass == qdata.repass){
        var sql = "update players set password = aes_encrypt('" + qdata.pass + "', unhex(sha2('"+ qdata.pass + "', 256))) where username = '" + qdata.user + "';";
        con.query(sql, function(err, result){
            if (err) throw err;
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "PASSWORD CHANGED SUCCESSFULLY",
                "input": "nothing",
                "display": "none"
            });
        });
    }
    else{
        res.render("ForgotPassword", {
            "heading": "nothing",
            "subheading": "PASSWORD AND REPASSWORD DOES NOT MATCH",
            "input": "nothing",
            "display": "none"
        });
    }
})
app.post("/login", urlencodedParser, function(req, res) {
    var qdata = {
        user:req.body.user,
        pass:req.body.pass
    };
    var sql = "select * from players where username = '" + qdata.user + "' and password = aes_encrypt('" + qdata.pass + "', unhex(sha2('"+ qdata.pass + "', 256)));";
    con.query(sql, function(err, result){
        if(err) throw err;
        if(result.length > 0){
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "LOGED IN SUCCESSFULLY",
                "input": "nothing",
                "display": "none"
            });
        }
        else{
            res.render("ForgotPassword", {
                "heading": "nothing",
                "subheading": "INVALID USERNAME OR PASSWORD",
                "input": "nothing",
                "display": "none"
            });
        }
    });
});

app.post("/signup", urlencodedParser, function(req, res) {
    var qdata = {
        user: req.body.user,
        pass: req.body.pass,
        repass: req.body.repass,
        email: req.body.email,
        name: req.body.name,
        ques: req.body.ques,
        ans: req.body.ans
    };
    if(qdata.pass != qdata.repass){
        res.send("password and re-password not matched");
        res.end(); 
        return;                                
    }
    var sql = "select * from players where username = '" + qdata.user +"';"; 
    console.log(qdata);
    con.query(sql, function(err, result){
        if(err) throw err;
        if(result.length > 0)
            res.send("username already used");
        else{
            console.log("here");
            var query = "insert into players values ('"+ qdata.name + "', '" + qdata.email + "', '" + qdata.user + "', aes_encrypt('" + qdata.pass + "', unhex(sha2('" + qdata.pass + "', 256))), '" + qdata.ques + "', aes_encrypt('ans', unhex(sha2('" + qdata.ans + "', 256))));";
            con.query(query, function(err, result){
                if(err) throw err;
                console.log("added data successfully");
                res.send("added data successfully");
            });
        }
    });
});

app.get("/login", function(req, res) {
  res.render("LoginPage");
});

app.get("/signup", function(req, res) {
  res.render("SignUp");
});


conn.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE IF NOT EXISTS `forum`.`Discussion` ( `dsc_id` INT NOT NULL, `dsc_name` VARCHAR(45) NOT NULL, `usr_id` VARCHAR(45) NULL, `thanks` INT, `data` VARCHAR(450) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`dsc_id`), UNIQUE INDEX `discussion_id_UNIQUE` (`dsc_id` ASC) VISIBLE)"
//   var comments="CREATE TABLE IF NOT EXISTS `forum`.`Comments` ( `idComments` INT NOT NULL, `usr_id` VARCHAR(45) NULL, `dsc_id` INT NULL, `cmt` VARCHAR(150) NULL, `post time` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (`idComments`), UNIQUE INDEX `idComments_UNIQUE` (`idComments` ASC) VISIBLE)";
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});
  
var posts=[]

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/about", function(req, res){
    res.render("About Page");
});

app.get("/", function(req, res){
    res.render("home");
});

app.get("/dashboard", function(req, res){
    res.render("dashboard");
});

app.get("/compose", function(req, res){
    res.render("compose");
});


app.post("/compose", function(req, res){
    const post={
        title: req.body.postTitle,
        body: req.body.postBody
    };
    posts.push(post);
    res.redirect();
});

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  
  console.log("Example app listening at http://%s:%s", host, port)
});