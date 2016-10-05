# git-crawler

This is a basic crawler in node platform. It reads a github username and then lists his/her repositories. Simultaneously it crawls through the repositories of his/her followings.

## Getting Started

You can either download this project as a zip file or clone using
```sh
$ git clone https://github.com/anil94/git-crawler.git
```

### Prerequisities

For running this project you should have [NodeJs](https://nodejs.org/en/) installed.

### Installing

After setting your local repo, move into your project folder

```sh
$ cd git-crawler
```

Then install all the required packeges by running the npm command
```sh
$ npm install
```

This command install all the dependencies mentioned in `package.json`

## Running

Run the app using node command

```sh
$ node main.js
```

Now your app is listening on port: 3000

Verify it by navigating to your server address in your preferred browser.
```sh
localhost:3000
```

Enter a valid github username as search term and see the result

## Authors

* **Anil Kumar P**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
