var url			=	require(`url`)
var express 	=   require(`express`)
var mongodb 	=   require('mongodb')
var validator	=	require('validator')
var randomstring =	require("randomstring")
var app = express()
 
// We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Mongodb connect db url.
var MongoUrl = 'mongodb://heroku_xdrxtkqx:41qbstm8r2q2hip8j2lac20j4t@ds151008.mlab.com:51008/heroku_xdrxtkqx';

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080

app.get('/', function(req, res) {
    res.send(`URL shortener`)
})

// Create new shortened URL.
app.get('/new/:url', function(req, res) {
    // Check if URL param is valid.
    var originalUrl = validator.isUrl(req.params.url) ? req.params.url : false
    if( !originalUrl ) {
        res.send( JSON.stringify({ error: `URL invalid`}) )
        return
    }
    
    // Generate short URL.
	var shortUrl	=	randomstring.generate(4)
    
    // Connect to DB.
    MongoClient.connect(MongoUrl, function(err, db) {
    	if(err)	console.error(err)
    	
        var docs    =	db.collection('urls')
        var newDoc  =   {
            original_url:	originalUrl,
            short_url:  	shortUrl,
        }
        
        // Insert.
        docs.insert(newDoc, function(err, data) {
    		if(err) console.error(err)
    		
    		console.log( JSON.stringify(data.ops) )
    		db.close()
        })
    })
    
    // Send JSON output.
    res.send( JSON.stringify({
    	original_url: originalUrl,
    	short_url: req.hostname + shortUrl,
    }) )
})

// Access shortened URL.
app.get('/:url', function(req, res) {
	// Connect to DB.
    MongoClient.connect(url, function(err, db) {
		if(err)	console.error(err)
		
		// db gives access to the database
		db.collection('urls').find({
			short_url:	req.params.url
		}).toArray(function(err, documents) {
			if(err) console.error(err)
			
			// Redirect to shortened URL.
			res.redirect(documents.original_url)
			db.close()
		})
	})
})

app.listen(port, function() {
    console.log('App listen on port: ' + port)
})