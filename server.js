
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

var request = require("request");
var cheerio = require("cheerio");

var app = express();


//app.use(methodOverride("_method"));
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var Promise = require("bluebird");

mongoose.Promise = Promise;


app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended:false 
}));

app.use(express.static("public"));

mongoose.connect("mongodb://heroku_gv6s1vvz:vk6ht5vo9mjghigo0una6mr8cj@ds157539.mlab.com:57539/heroku_gv6s1vvz");

var db = mongoose.connection;

// show any mongoose errors
db.on("error", function(error) {

	console.log("Mongoose Error: ", error);
});

db.once("open", function () {

	console.log("Mongoose connection successful.");
});



// Routes

// index Route

app.get("/",function(req,res) {

	res.send(index.html);


});

app.get("/scrape", function (req,res) {

		request("https://www.nytimes.com/", function (error, response, html){

			var $ = cheerio.load(html);

				// grabbing each h2 element
			$("h2.story-heading").each(function(i,element){

				var result = {};

				result.title = $(this).children("a").text();
				result.link = $(this).children("a").attr("href");


				var entry = new Article(result);

				entry.save(function(err, doc){

					if(err) {
						console.log(err);
					}

					else {
						console.log(doc);
					}
				});

			});		

			res.send("Scrape Complete");	

			//res.redirect(index.html);

		})


})

app.get("/articles", function(req, res){

	Article.find(function(err, response) {

		if(err) 
		{
					console.log(err);
				}

		else {
					console.log(response);
					res.json(response);
			 }
	});

});






app.put("/saved", function(req, res){

console.log(req.body);

	var articleId = req.body.id;

	console.log("article ID is " + articleId);
	Article.update(

	{
		"_id":articleId
	},
		{
			$set: 
					{
		            saved: true
		        	}
		        }
	,function(err, response) {

		if(err) 
		{
				console.log(err);
		}

		else {
					console.log(response);
					res.json(response);
			 }
	});

})




app.get("/savedArticles", function(req, res){

	Article.find({saved:true},function(err, response) {

		if(err) 
		{
				console.log(err);
		}

		else {
					console.log(response);

					res.render("index",{articles:response});
					//res.send(response);
					//res.sendFile(path.join(__dirname+'saved.html'));
  				
			 }
	});



});



app.get("/articleWithNotes", function(req, res){

	Article.find({saved:true},function(err, response) {

		if(err) 
		{
				console.log(err);
		}

		else {
					console.log(response);

					res.render("index",{articles:response});
					//res.send(response);
					//res.sendFile(path.join(__dirname+'saved.html'));
  				
			 }
	});



});


app.post('/article/:id/note', function(req, res) {

	console.log(req.body);

	Note.create(req.body, function(error, saved) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the note back to the browser
    // This will fire off the success function of the ajax request
    else {
      res.redirect('/savedArticles');
      console.log(saved);
    }
  

});

});


// app.post("/submit", function(req, res) {
//   console.log(req.body);
//   // Insert the note into the notes collection
//   Note.create(req.body, function(error, saved) {
//     // Log any errors
//     if (error) {
//       console.log(error);
//     }
//     // Otherwise, send the note back to the browser
//     // This will fire off the success function of the ajax request
//     else {
//       res.send(saved);
//     }
//   });
// });

	
	


app.listen(3000, function() {
  console.log("App running on port 3000!");
});
