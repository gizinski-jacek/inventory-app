const Category = require('../models/category');
const Item = require('../models/item');
const Admin = require('../models/admin');
const async = require('async');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

exports.item_list = (req, res, next) => {
	Item.find().exec((err, item_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_list', {
			title: 'Catalog',
			catalog: '/catalog/',
			item_list: item_list,
		});
	});
};

exports.category_item_list = (req, res, next) => {
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
				category: results.category,
			});
		}
	);
};

exports.item_details = (req, res, next) => {
	Item.findById(req.params.id).exec((err, item) => {
		if (err) {
			return next(err);
		}
		res.render('item_details', {
			title: item.name,
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
		.isLength({ min: 3, max: 30 })
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
		if (req.file) {
			item.imgName = req.file.filename;
		}
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
	Item.findById(req.params.id).exec((err, item) => {
		if (err) {
			return next(err);
		}
		if (item == null) {
			res.redirect(req.baseUrl);
		}
		res.render('item_delete', { title: 'Delete item', item: item });
	});
};

exports.item_delete_post = (req, res, next) => {
	body('adminpass', 'Must provide admin password for this action')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1 })
		.escape(),
		async.parallel(
			{
				item: (cb) => {
					Item.findById(req.params.id).exec(cb);
				},
				adminpass: (cb) => {
					Admin.find({ adminpass: req.body.adminpass }).exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				if (results.item.permanent) {
					if (
						req.body.itemispermanent.toString() ===
						results.item.permanent.toString()
					) {
						if (results.adminpass.length === 0) {
							res.render('item_delete', {
								title: 'Delete item',
								item: results.item,
								pass_check: false,
							});
							return;
						} else {
							Item.findByIdAndDelete(req.params.id, (err) => {
								if (err) {
									return next(err);
								}
								res.redirect(req.baseUrl);
							});
						}
					}
				} else {
					Item.findByIdAndDelete(req.params.id, (err) => {
						if (err) {
							return next(err);
						}
						res.redirect(req.baseUrl);
					});
				}
			}
		);
};

exports.item_update_get = (req, res, next) => {
	async.parallel(
		{
			item: (cb) => {
				Item.findById(req.params.id).exec(cb);
			},
			category_list: (cb) => {
				Category.find().exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			res.render('item_form', {
				title: 'Update item',
				item: results.item,
				category_list: results.category_list,
			});
		}
	);
};

exports.item_update_post = [
	body('name', 'Item name must not be empty')
		.trim()
		.isLength({ min: 3, max: 30 })
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
	body('adminpass', 'Must provide admin password for this action')
		.if(body('categoryispermanent').equals('true'))
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		async.parallel(
			{
				item: (cb) => {
					Category.findById(req.params.id).exec(cb);
				},
				category_list: (cb) => {
					Category.find().exec(cb);
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
				const item = new Item({
					name: req.body.name,
					description: req.body.description
						? req.body.description
						: req.body.name,
					category: req.body.category,
					price: req.body.price,
					stock: req.body.stock,
					permanent: results.category.permanent,
					_id: req.params.id,
				});
				if (req.file) {
					item.imgName = req.file.filename;
				}
				if (!errors.isEmpty()) {
					res.render('item_form', {
						title: 'Update item',
						item: item,
						category_list: results.category_list,
						errors: errors.array(),
					});
					return;
				}
				if (results.item.permanent) {
					if (
						req.body.itemispermanent.toString() ===
						results.item.permanent.toString()
					) {
						if (results.adminpass.length === 0) {
							res.render('item_form', {
								title: 'Update item',
								item: item,
								pass_check: false,
							});
							return;
						} else {
							Item.findByIdAndUpdate(
								req.params.id,
								item,
								(err, theitem) => {
									if (err) {
										return next(err);
									}
									res.redirect(
										`/catalog/${req.body.category}${theitem.url}`
									);
								}
							);
						}
					}
				} else {
					Item.findByIdAndUpdate(
						req.params.id,
						item,
						(err, theitem) => {
							if (err) {
								return next(err);
							}
							res.redirect(
								`/catalog/${req.body.category}${theitem.url}`
							);
						}
					);
				}
			}
		);
	},
];
