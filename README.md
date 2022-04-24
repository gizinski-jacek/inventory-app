# Inventory App

Inventory App built with Node.JS/Express as backend, MongoDB as database, and using Heroku to host it.

Using populateDB.js script will fill database with few categories and products which are considered as permanent. Updating and deleting those will be possible only by entering an admin password. Creating for users is not restricted by password, same goes for updating and deleting users category, product and product picture.

## Table of contents

- [Github & Live](#github--live)
- [Getting Started](#getting-started)
- [Deploy](#deploy)
- [Features](#features)
- [Status](#status)
- [Contact](#contact)

# Github & Live

Github repo can be found [here](https://github.com/gizinski-jacek/inventory-app)

This repo is live on [Heroku](https://inventory-app-68413.herokuapp.com)

## Getting Started

Install all dependancies by running:

```bash
npm install
```

In the project root directory run the app with:

```bash
npm run devstart
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploy

You can easily deploy this app using [Heroku Platform](https://devcenter.heroku.com/articles/git).

Script for running app build after deployment to Heroku is included in package.json.\
In the project root directory run these commands:

```bash
heroku create
git push heroku main
heroku open
```

## Features

- Create, edit and delete categories
- Create, edit and delete products
- Upload and delete product picture

## Status

Project status: **_FINISHED_**

## Contact

Feel free to contact me at:

```
jacektrg@gmail.com
```
