const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Display items from specific category
exports.category_item_list = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.categoryid)) {
		let err = new Error('Invalid category ObjectId');
		err.status = 404;
		return next(err);
	}
	async.parallel(
		{
			category: (cb) => {
				Category.findById(req.params.categoryid).exec(cb);
			},
			item_list: (cb) => {
				Item.find({ category: req.params.categoryid })
					.populate('category')
					.exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				let err = new Error('Category was not found');
				err.status = 404;
				return next(err);
			}
			res.render('item_list', {
				title: results.category.name,
				item_list: results.item_list,
				category: results.category,
			});
		}
	);
};

// Display category create form on GET
exports.category_create_get = (req, res, next) => {
	res.render('category_form', { title: 'Create category' });
};

// Handle category creation on POST
exports.category_create_post = [
	body('name', 'Category name must not be empty')
		.trim()
		.isLength({ min: 3, max: 15 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
	(req, res, next) => {
		Category.find({ name: req.body.name })
			.countDocuments()
			.exec((err, duplicatesFound) => {
				if (err) {
					return next(err);
				}
				if (duplicatesFound > 0) {
					res.render('category_form', {
						title: 'Create category',
						category: req.body,
						errors: [{ msg: 'Category already exists' }],
					});
					return;
				}
				const errors = validationResult(req);
				const newCategory = new Category({
					name: req.body.name,
					description: req.body.description
						? req.body.description
						: req.body.name,
				});
				if (!errors.isEmpty()) {
					res.render('category_form', {
						title: 'Create category',
						category: newCategory,
						errors: errors.array(),
					});
				}
				newCategory.save((err) => {
					if (err) {
						return next(err);
					}
					res.redirect(newCategory.url);
				});
			});
	},
];

// Display category delete page on GET
exports.category_delete_get = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.categoryid)) {
		let err = new Error('Invalid category ObjectId');
		err.status = 404;
		return next(err);
	}
	async.parallel(
		{
			category: (cb) => {
				Category.findById(req.params.categoryid).exec(cb);
			},
			category_items: (cb) => {
				Item.find({ category: req.params.categoryid }).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				let err = new Error(
					'Category was not found. Nothing was deleted.'
				);
				err.status = 404;
				return next(err);
			}
			res.render('category_delete', {
				title: 'Delete category',
				category: results.category,
				category_items: results.category_items,
			});
		}
	);
};

// Handle category delete on POST
exports.category_delete_post = [
	body('adminpass')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1, max: 64 })
		.escape(),
	(req, res, next) => {
		async.parallel(
			{
				category: (cb) => {
					Category.findById(req.params.categoryid).exec(cb);
				},
				category_items: (cb) => {
					Item.find({ category: req.params.categoryid }).exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				if (results.category.permanent) {
					if (req.body.adminpass != process.env.ADMIN_PASSWORD) {
						let err = new Error(
							'The password you entered is incorrect.'
						);
						err.status = 401;
						return next(err);
					}
				}
				if (results.category_items.length > 0) {
					res.render('category_delete', {
						title: 'Delete category',
						category: results.category,
						category_items: results.category_items,
					});
					return;
				}
				Category.findByIdAndDelete(req.params.categoryid, (err) => {
					if (err) {
						return next(err);
					}
					res.redirect('/catalog');
				});
			}
		);
	},
];

// Display category update form on GET
exports.category_update_get = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.categoryid)) {
		let err = new Error('Invalid category ObjectId');
		err.status = 404;
		return next(err);
	}
	Category.findById(req.params.categoryid).exec((err, category) => {
		if (err) {
			return next(err);
		}
		if (category == null) {
			let err = new Error('Category was not found. Nothing was updated.');
			err.status = 404;
			return next(err);
		}
		res.render('category_form', {
			title: 'Update category',
			category: category,
		});
	});
};

// Handle category update on POST
exports.category_update_post = [
	body('name', 'Category name must not be empty')
		.trim()
		.isLength({ min: 3, max: 15 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
	body('adminpass')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1, max: 64 })
		.escape(),
	(req, res, next) => {
		Category.findById(req.params.categoryid).exec((err, category) => {
			if (err) {
				return next(err);
			}
			if (category.permanent) {
				if (req.body.adminpass != process.env.ADMIN_PASSWORD) {
					let err = new Error(
						'The password you entered is incorrect.'
					);
					err.status = 401;
					return next(err);
				}
			}
			const errors = validationResult(req);
			const categoryUpdate = new Category({
				name: req.body.name,
				description: req.body.description
					? req.body.description
					: req.body.name,
				permanent: category.permanent,
				_id: req.params.categoryid,
			});
			if (!errors.isEmpty()) {
				res.render('category_form', {
					title: 'Update category',
					category: categoryUpdate,
					errors: errors.array(),
				});
				return;
			}
			Category.findByIdAndUpdate(
				req.params.categoryid,
				categoryUpdate,
				(err, updatedCategory) => {
					if (err) {
						return next(err);
					}
					res.redirect(updatedCategory.url);
				}
			);
		});
	},
];
