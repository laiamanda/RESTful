var express 	 = require("express"),
	bodyParser 	 = require("body-parser"),
	methodOverride = require("method-override"),
	expressSanitizer = require("express-sanitizer");
	app 		 = express();
	
const mongoose = require('mongoose');
//create the mongo database
mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL/SCHEMA
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type:Date, default: Date.now}
});

var blogs = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES
app.get("/", function(req,res){
	res.redirect("/blogs");
});
//INDEX ROUTE
app.get("/blogs", function(req,res){
	blogs.find({},function(err,blogs){
		if (err){
			console.log("ERROR" + err);
		}
		else{
			res.render("index", {blogs:blogs});
		}
	});
});

//NEW ROUTE
app.get("/blogs/new",function(req,res){
	res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	//create blog
	blogs.create(req.body.blog,function(err,newBlog){
		if(err){
			res.render("new");
		}
		//redirect to index
		else{
			res.redirect("/blogs");
		}
	});
	
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
	blogs.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show",{blog:foundBlog});
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
	blogs.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("edit",{blog:foundBlog});	
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	blogs.findByIdAndUpdate(req.params.id,req.body.blog, function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id",function(req,res){
	//delete blog
	blogs.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
	//redirect somewhere
});

app.listen(3000,function(){
	console.log("Blog is Running");
});
