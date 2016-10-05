var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser')
var eventEmitter = require('events').EventEmitter

var app = express();
app.use(express.static(__dirname + '/static'))
app.use(bodyParser.urlencoded({
	extended: true
}))
app.use(bodyParser.json())

var ee;

// loads index page
app.get('/', function(req, res) {
	console.log("GET " + req.url)
	res.sendFile(__dirname + '/index.html')
});

var results, urlsToVisit
var baseurl = "https://github.com/", repoTab = "?tab=repositories", folwTab = "?tab=following"

app.post('/', function(req, res) {
	urlsToVisit = []
	results = []
	ee = new eventEmitter
	var search = req.body.name

	console.log("POST '/' username: " + search)

	urlsToVisit.push(baseurl + search + repoTab)
	getFollowers(baseurl + search + folwTab)

	// executes when all followers are fetched
	ee.on('followers fetched', function() {
		getRepoInfo()
	})

	ee.on('repos fetched', function() {
		console.log(" \x1b[32m%s\x1b[0m", "Crawling completed")
		res.send(["success", results])
	})

	ee.on('error occured', function(error) {
		res.send(["failed", error])
		return
	})
})

function getRepoInfo() {
	var count = urlsToVisit.length
	urlsToVisit.forEach(function(url) {
		request(url, function(error, response, html) {
		//fs.readFile(__dirname + '/ymotongpoo.html', function(error,html) {
			var repos = [], fname, uname
			if (error) {
				console.log(" \x1b[31m%s\x1b[0m", "Error : " + error)
				ee.emit('error occured', error)
			} else {
				var $ = cheerio.load(html)
				fname = $('h1 > .vcard-fullname').text()
				uname = $('h1 > .vcard-username').text()
				console.log(" Fetching " + fname + "'s repositories...")
				$('.js-repo-list').filter(function() {
					$(this).children().each(function() {
						var data = $(this).find('h3 > a')
						var repo_name = $(data).text().replace(/\s+/g, ' ')
						var repo_link = $(data).attr('href')
						var description = $(this).find('.d-table-cell.col-6').children().last().text().replace(/\s+/g, ' ')
						var language = $(this).find('.d-table-cell.col-2').children().last().text().replace(/\s+/g, ' ')
						var stars = $(this).find('.d-table-cell.col-1 > a').text().replace(/\s+/g, ' ')
						repos.push({
										"name" : repo_name,
										"link" : "https://github.com" + repo_link,
										"description" : description,
										"language" : language,
										"stars"	: stars
									})
					})
				})
				console.log(" \x1b[32m%s\x1b[0m", "Successfully fetched " + fname + "'s repositories!")
				results.push(
								{
									"fullname"	: fname,
									"username"	: uname,
									"repos"		: repos
								}
							);
				if(!--count) {
					ee.emit('repos fetched')
				}
			}
		})
		console.log("visiting \x1b[33m%s\x1b[0m", url)
	})
}

function getFollowers(url) {
	console.log("Requesting \x1b[33m%s\x1b[0m", url)
	request(url, function(error, response, html) {
	//fs.readFile(__dirname + '/following.html', function(error, html) {
		if (error) {
			console.log(" \x1b[31m%s\x1b[0m", "Error : " + error)
			ee.emit('error occured', error)
		} else {
			var $ = cheerio.load(html), followings = []
			$('.js-repo-filter').filter(function() {
				$(this).children('.col-12').each(function() {
					var names = $(this).find('.col-9 > a').children()
					followings.push({
										username: $(names).last().text().replace(/\s+/g, ' ')
										//fullname: $(names).first().text().replace(/\s+/g, ' ')
									})
				})
			})
			console.log("Followers are :")
			followings.forEach(function(follower) {
				// var repos = getRepoInfo("https://github.com/" + follower.username + "?tab=repositories")
				urlsToVisit.push(baseurl + follower.username + repoTab)
				console.log("\x1b[2m >> %s\x1b[0m", follower.username)
			})
			ee.emit('followers fetched')
		}
	})
}

var server = app.listen(3000, function() {
	console.log('Server running at localhost:%s', server.address().port);
});