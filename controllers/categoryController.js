const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.category_list = (req, res, next) => {
	Category.find().exec((err, category_list) => {
		if (err) {
			return next(err);
		}
		res.render('index', {
			title: 'F1 Shop',
			category_list: category_list,
		});
	});
};

exports.category_index = (req, res, next) => {
	async.parallel(
		{
			category: (cb) => {
				Category.findById(req.params.id).exec(cb);
			},
			item_list: (cb) => {
				Item.find({ category: req.params.id }).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('item_list', {
				title: results.category.name,
				item_list: results.item_list,
			});
		}
	);
};

exports.category_create_get = (req, res, next) => {
	res.render('category_form', { title: 'Create category' });
};

exports.category_create_post = [
	body('name', 'Category name must not be empty')
		.trim()
		.isLength({ min: 1, max: 20 })
		.escape(),
	body('description').trim().isLength({ max: 100 }).escape(),
	(req, res, next) => {
		const errors = validationResult(req);
		const category = new Category({
			name: req.body.name,
			description: req.body.description
				? req.body.description
				: req.body.name,
		});
		if (!errors.isEmpty()) {
			res.render('category_form', {
				title: 'Create category',
				category: req.body,
				errors: errors.array(),
			});
		} else {
			category.save((err) => {
				if (err) {
					return next(err);
				}
				res.redirect(category.url);
			});
		}
	},
];

exports.category_delete_get = (req, res, next) => {
	res.render('category_delete', { title: 'Delete category' });
};

exports.category_delete_post = (req, res, next) => {
	res.render('category_delete', { title: 'Delete category' });
};

exports.category_update_get = (req, res, next) => {
	res.render('category_form', { title: 'Update category' });
};

exports.category_update_post = (req, res, next) => {
	res.render('category_form', { title: 'Update category' });
};
