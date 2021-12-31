const Category = require('../models/category');
const Item = require('../models/item');
const Admin = require('../models/admin');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.category_create_get = (req, res, next) => {
	res.render('category_form', { title: 'Create category' });
};

exports.category_create_post = [
	body('name', 'Category name must not be empty')
		.trim()
		.isLength({ min: 3, max: 15 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
	(req, res, next) => {
		Category.find({ name: req.body.name })
			.countDocuments()
			.exec((err, count) => {
				if (err) {
					return next(err);
				}
				if (count > 0) {
					res.render('category_form', {
						title: 'Create category',
						category: req.body,
						errors: [{ msg: 'Category already exists' }],
					});
					return;
				}
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
						category: category,
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
			});
	},
];

exports.category_delete_get = (req, res, next) => {
	async.parallel(
		{
			category: (cb) => {
				Category.findById(req.params.id).exec(cb);
			},
			category_items: (cb) => {
				Item.find({ category: req.params.id }).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.category == null) {
				let err = new Error('Oops. Category was not found.');
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

exports.category_delete_post = [
	body('adminpass', 'Must provide admin password for this action')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		async.parallel(
			{
				category: (cb) => {
					Category.findById(req.params.id).exec(cb);
				},
				category_items: (cb) => {
					Item.find({ category: req.params.id }).exec(cb);
				},
				adminpass: (cb) => {
					Admin.find({ adminpass: req.body.adminpass }).exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				if (results.category_items.length > 0) {
					res.render('category_delete', {
						title: 'Delete category',
						category: results.category,
						category_items: results.category_items,
					});
					return;
				}
				if (results.category.permanent) {
					if (
						req.body.categoryispermanent.toString() ===
						results.category.permanent.toString()
					) {
						if (results.adminpass.length === 0) {
							let err = new Error(
								'The password you entered is incorrect.'
							);
							err.status = 401;
							return next(err);
						} else {
							Category.findByIdAndDelete(req.params.id, (err) => {
								if (err) {
									return next(err);
								}
								res.redirect('/catalog');
							});
						}
					}
				} else {
					Category.findByIdAndDelete(req.params.id, (err) => {
						if (err) {
							return next(err);
						}
						res.redirect('/catalog');
					});
				}
			}
		);
	},
];

exports.category_update_get = (req, res, next) => {
	Category.findById(req.params.id).exec((err, category) => {
		if (err) {
			return next(err);
		}
		if (category == null) {
			let err = new Error('Oops. Category was not found.');
			err.status = 404;
			return next(err);
		}
		res.render('category_form', {
			title: 'Update category',
			category: category,
		});
	});
};

exports.category_update_post = [
	body('name', 'Category name must not be empty')
		.trim()
		.isLength({ min: 3, max: 15 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
	body('adminpass', 'Must provide admin password for this action')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		async.parallel(
			{
				category: (cb) => {
					Category.findById(req.params.id).exec(cb);
				},
				adminpass: (cb) => {
					Admin.find({ adminpass: req.body.adminpass }).exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				const errors = validationResult(req);
				const category = new Category({
					name: req.body.name,
					description: req.body.description
						? req.body.description
						: req.body.name,
					permanent: results.category.permanent,
					_id: req.params.id,
				});
				if (!errors.isEmpty()) {
					res.render('category_form', {
						title: 'Update category',
						category: category,
						errors: errors.array(),
					});
					return;
				}
				if (results.category.permanent) {
					if (
						req.body.categoryispermanent.toString() ===
						results.category.permanent.toString()
					) {
						if (results.adminpass.length === 0) {
							let err = new Error(
								'The password you entered is incorrect.'
							);
							err.status = 401;
							return next(err);
						} else {
							Category.findByIdAndUpdate(
								req.params.id,
								category,
								(err, thecategory) => {
									if (err) {
										return next(err);
									}
									res.redirect(thecategory.url);
								}
							);
						}
					}
				} else {
					Category.findByIdAndUpdate(
						req.params.id,
						category,
						(err, thecategory) => {
							if (err) {
								return next(err);
							}
							res.redirect(thecategory.url);
						}
					);
				}
			}
		);
	},
];
