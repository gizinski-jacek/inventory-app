const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.item_details = (req, res, next) => {
	Item.findById(req.params.id).exec((err, item) => {
		if (err) {
			return next(err);
		}
		res.render('item_details', {
			title: 'F1 Shop',
			item: item,
		});
	});
};

exports.item_create_get = (req, res, next) => {
	Category.find().exec((err, category_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_form', {
			title: 'Create item',
			category_list: category_list,
		});
	});
};

exports.item_create_post = [
	body('name', 'Item name must not be empty')
		.trim()
		.isLength({ min: 1, max: 30 })
		.escape(),
	body('description').trim().isLength({ max: 100 }).escape(),
	body('category').escape(),
	body('price', 'Item price must not be empty')
		.trim()
		.isNumeric({ min: 0 })
		.escape(),
	body('stock', 'Item stock must not be empty')
		.trim()
		.isNumeric({ min: 0 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const item = new Item({
			name: req.body.name,
			description: req.body.description
				? req.body.description
				: req.body.name,
			category: req.body.category,
			price: req.body.price,
			stock: req.body.stock,
		});
		if (!errors.isEmpty()) {
			Category.find().exec((err, category_list) => {
				if (err) {
					return next(err);
				}
				res.render('item_form', {
					title: 'Create item',
					category_list: category_list,
					item: item,
					errors: errors.array(),
				});
			});
			return;
		} else {
			item.save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect(`/catalog/${req.body.category}${item.url}`);
			});
		}
	},
];

exports.item_delete_get = (req, res, next) => {
	res.render('item_delete', { title: 'Delete category' });
};

exports.item_delete_post = (req, res, next) => {
	res.render('item_delete', { title: 'Delete category' });
};

exports.item_update_get = (req, res, next) => {
	res.render('item_form', { title: 'Delete category' });
};

exports.item_update_post = (req, res, next) => {
	res.render('item_form', { title: 'Delete category' });
};
