#! /usr/bin/env node

console.log(
	'This script populates some test categories and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const Category = require('./models/category');
const Item = require('./models/item');

const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const categories = [];
const items = [];

const categoryCreate = (name, description, permanent, cb) => {
	let categorydetail = {
		name: name,
		description: description,
		permanent: permanent,
	};
	if (!description) {
		categorydetail.description = name;
	}

	const category = new Category(categorydetail);
	category.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Category: ' + category);
		categories.push(category);
		console.log(categories[0]._id);
		cb(null, category);
	});
};

const itemCreate = (
	name,
	description,
	category,
	price,
	stock,
	permanent,
	cb
) => {
	itemdetail = {
		name: name,
		description: description,
		category: category,
		price: price,
		stock: stock,
		permanent: permanent,
	};

	const item = new Item(itemdetail);

	item.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Item: ' + item);
		items.push(item);
		cb(null, item);
	});
};

function createCategories(cb) {
	async.series(
		[
			function (callback) {
				categoryCreate('Headwear', 'Formula 1 headwear', 1, callback);
			},
			function (callback) {
				categoryCreate('Shirts', 'Formula 1 shirts', 1, callback);
			},
			function (callback) {
				categoryCreate('Jackets', 'Formula 1 jackets', 1, callback);
			},
			function (callback) {
				categoryCreate('Glasses', 'Formula 1 glasses', 1, callback);
			},
			function (callback) {
				categoryCreate(
					'Accessories',
					'Formula 1 accessories',
					1,
					callback
				);
			},
			function (callback) {
				categoryCreate('Posters', 'Formula 1 posters', 1, callback);
			},
		],
		// Optional callback
		cb
	);
}

function createItems(cb) {
	async.parallel(
		[
			function (callback) {
				itemCreate(
					'F1 Classic Cap',
					'A Classic Formula 1 cap.',
					categories[0],
					15.99,
					15,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Mesh Cap',
					'A mesh Formula 1 cap.',
					categories[0],
					17.99,
					10,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Beanie',
					'A Formula 1 beanie.',
					categories[0],
					24.99,
					5,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Sunglasses',
					'An Formula 1 sunglasses',
					categories[1],
					39.99,
					8,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Jacket',
					'A Formula 1 jacket',
					categories[2],
					79.99,
					16,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Hoodie',
					'A Formula 1 hoodie',
					categories[2],
					99.99,
					18,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Shirt',
					'A Formula 1 Shirt',
					categories[3],
					89.99,
					20,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Backpack',
					'A Formula 1 backpack',
					categories[4],
					59.99,
					14,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Wireless Earphones',
					'A Formula 1 wireless earphones',
					categories[4],
					39.99,
					10,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'F1 Poster',
					'A Formula 1 poster',
					categories[5],
					19.99,
					30,
					1,
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

async.series(
	[createCategories, createItems],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
