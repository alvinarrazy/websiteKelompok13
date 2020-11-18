var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mongodblogintest";

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var loginToken = false;

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({extended : true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, '/')));

app.get('/', function(request, response) {
	if(loginToken == true){
		response.sendFile(path.join(__dirname + '/homepage.html'));
	}

	response.sendFile(path.join(__dirname + '/noLogin.html'));

});

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
});

app.post('/auth', function(request, response) {
	MongoClient.connect(url, function(err,db){
		var inputemail = request.body.email;
		var inputpassword = request.body.password;

		console.log(inputemail+" "+inputpassword);
		var finding = {email: inputemail, password: inputpassword};
		var dbo = db.db("mongodblogintest");
		dbo.collection("accounts").find(finding).toArray(function(err, res){
			if(res.length > 0){
				loginToken = true;
				response.sendFile(path.join(__dirname + '/homepage.html'));
				console.log("account found");
			}else{
				response.send("ERROR!");
			}
		});
	});
});

app.post('/createaccount', function(request, response) {
	response.sendFile(path.join(__dirname + '/registration.html'));
});

app.post('/creatingaccount', function(request, response) {
	MongoClient.connect(url, function(err, db){
		var newemail = request.body.newemail;
		var newpassword = request.body.newpassword;
		var confpassword = request.body.confpassword;
		var myobj = { email: newemail, password: newpassword };
		var dbo = db.db("mongodblogintest");
  		dbo.collection("accounts").insertOne(myobj, function(err, res) {
    		if (err) throw err;
    		console.log("1 document inserted");
    		db.close();
		});	
		if(newpassword == confpassword){
				response.sendFile(path.join(__dirname + '/login.html'));
		}else{
			setCustomValidity("Passwords Don't Match");
		}
	});
});

app.listen(3000, () => console.log(__dirname + '/'));