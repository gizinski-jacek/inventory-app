const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const fs = require('fs');
const ADMIN_PASSWORD = 'if gap = car';

// Display all items in database
exports.item_list = (req, res, next) => {
	Item.find()
		.populate('category')
		.exec((err, item_list) => {
			if (err) {
				return next(err);
			}
			res.render('item_list', {
				title: 'Catalog',
				item_list: item_list,
			});
		});
};

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
			res.render('item_list', {
				title: results.category.name,
				item_list: results.item_list,
				category: results.category,
			});
		}
	);
};

// Display item details page
exports.item_details = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.itemid)) {
		let err = new Error('Invalid item ObjectId');
		err.status = 404;
		return next(err);
	}
	Item.findById(req.params.itemid).exec((err, item) => {
		if (err) {
			return next(err);
		}
		res.render('item_details', {
			title: item.name,
			item: item,
		});
	});
};

// Display item create form on GET
exports.item_create_get = (req, res, next) => {
	Category.find().exec((err, category_list) => {
		if (err) {
			return next(err);
		}
		res.render('item_form', {
			title: 'Add item',
			category_list: category_list,
		});
	});
};

// Handle item create on POST
exports.item_create_post = [
	body('name', 'Item name must not be empty')
		.trim()
		.isLength({ min: 3, max: 30 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
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
		const newItem = new Item({
			name: req.body.name,
			description: req.body.description
				? req.body.description
				: req.body.name,
			category: req.body.category,
			price: req.body.price,
			stock: req.body.stock,
		});
		if (req.file && errors.isEmpty()) {
			newItem.imgName = req.file.filename;
			console.log(`New item file added: ${newItem.imgName}`);
		}
		if (!errors.isEmpty()) {
			if (req.file) {
				fs.unlink(
					`public/uploads/images/${req.file.filename}`,
					(err) => {
						if (err) {
							console.log(err);
						} else {
							console.log(
								`New item form errors. \nNew file from form deleted: ${req.file.filename}`
							);
						}
					}
				);
			}
			Category.find().exec((err, category_list) => {
				if (err) {
					return next(err);
				}
				res.render('item_form', {
					title: 'Add item',
					category_list: category_list,
					item: newItem,
					errors: errors.array(),
				});
			});
			return;
		}
		newItem.save((err) => {
			if (err) {
				return next(err);
			}
			res.redirect(`/catalog/${newItem.category}${newItem.url}`);
		});
	},
];

// Display item delete page on GET
exports.item_delete_get = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.itemid)) {
		let err = new Error('Invalid item ObjectId');
		err.status = 404;
		return next(err);
	}
	Item.findById(req.params.itemid).exec((err, item) => {
		if (err) {
			return next(err);
		}
		if (item == null) {
			let err = new Error('Item was not found. Nothing was deleted.');
			err.status = 404;
			return next(err);
		}
		res.render('item_delete', {
			title: 'Delete item',
			item: item,
		});
	});
};

// Handle item delete on POST
exports.item_delete_post = [
	body('adminpass')
		.if(body('itemispermanent').equals('true'))
		.trim()
		.isLength({ min: 1, max: 64 })
		.escape(),
	(req, res, next) => {
		Item.findById(req.params.itemid).exec((err, item) => {
			if (err) {
				return next(err);
			}
			if (item.permanent) {
				if (req.body.adminpass != ADMIN_PASSWORD) {
					let err = new Error(
						'The password you entered is incorrect.'
					);
					err.status = 401;
					return next(err);
				}
			}
			Item.findByIdAndDelete(req.params.itemid, (err) => {
				if (err) {
					return next(err);
				}
				fs.unlink(`public/uploads/images/${item.imgName}`, (err) => {
					if (err) {
						console.log(err);
					} else {
						console.log(
							`Item associated file deleted: ${item.imgName}`
						);
					}
				});
				res.redirect('../');
			});
		});
	},
];

// Display item image delete page on GET
exports.item_image_delete_get = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.itemid)) {
		let err = new Error('Invalid item ObjectId');
		err.status = 404;
		return next(err);
	}
	Item.findById(req.params.itemid).exec((err, item) => {
		if (err) {
			return next(err);
		}
		if (item == null) {
			let err = new Error('Item was not found. Nothing was deleted.');
			err.status = 404;
			return next(err);
		}
		if (item.imgName == null) {
			let err = new Error('Image was not found. Nothing was deleted.');
			err.status = 404;
			return next(err);
		}
		res.render('image_delete', {
			title: 'Delete image for item',
			item: item,
		});
	});
};

// Handle item image delete on POST
exports.item_image_delete_post = [
	body('adminpass')
		.if(body('itemispermanent').equals('true'))
		.trim()
		.isLength({ min: 1, max: 64 })
		.escape(),
	(req, res, next) => {
		Item.findById(req.params.itemid).exec((err, item) => {
			if (err) {
				return next(err);
			}
			if (item.permanent) {
				if (req.body.adminpass != ADMIN_PASSWORD) {
					let err = new Error(
						'The password you entered is incorrect.'
					);
					err.status = 401;
					return next(err);
				}
			}
			Item.findOneAndUpdate(
				{ _id: req.params.itemid },
				{ imgName: null },
				(err, updatedItem) => {
					if (err) {
						return next(err);
					}
					fs.unlink(
						`public/uploads/images/${item.imgName}`,
						(err) => {
							if (err) {
								console.log(err);
							}
							console.log(`Image file deleted: ${item.imgName}`);
						}
					);
					res.redirect(`..${updatedItem.url}`);
				}
			);
		});
	},
];

// Display item update form on GET
exports.item_update_get = (req, res, next) => {
	if (!mongoose.Types.ObjectId.isValid(req.params.itemid)) {
		let err = new Error('Invalid item ObjectId');
		err.status = 404;
		return next(err);
	}
	async.parallel(
		{
			item: (cb) => {
				Item.findById(req.params.itemid).exec(cb);
			},
			category_list: (cb) => {
				Category.find().exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.item == null) {
				let err = new Error('Item was not found. Nothing was updated.');
				err.status = 404;
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

// Handle item update on POST
exports.item_update_post = [
	body('name', 'Item name must not be empty')
		.trim()
		.isLength({ min: 3, max: 30 })
		.escape(),
	body('description').trim().isLength({ max: 200 }).escape(),
	body('category').escape(),
	body('price', 'Item price must not be empty')
		.trim()
		.isNumeric({ min: 0 })
		.escape(),
	body('stock', 'Item stock must not be empty')
		.trim()
		.isNumeric({ min: 0 })
		.escape(),
	body('adminpass')
		.if(body('itemispermanent').equals('true'))
		.trim()
		.isLength({ min: 1, max: 64 })
		.escape(),
	(req, res, next) => {
		async.parallel(
			{
				item: (cb) => {
					Item.findById(req.params.itemid).exec(cb);
				},
				category: (cb) => {
					Category.findById(req.params.categoryid).exec(cb);
				},
				category_list: (cb) => {
					Category.find().exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				if (results.item.permanent) {
					if (req.body.adminpass != ADMIN_PASSWORD) {
						let err = new Error(
							'The password you entered is incorrect.'
						);
						err.status = 401;
						return next(err);
					}
				}
				const errors = validationResult(req);
				const itemUpdate = new Item({
					name: req.body.name,
					description: req.body.description
						? req.body.description
						: req.body.name,
					category: req.body.category,
					price: req.body.price,
					stock: req.body.stock,
					permanent: results.item.permanent,
					_id: req.params.itemid,
				});
				if (req.file && errors.isEmpty()) {
					itemUpdate.imgName = req.file.filename;
					console.log(
						`Updated image file added: ${itemUpdate.imgName}`
					);
					if (results.item.imgName) {
						fs.unlink(
							`public/uploads/images/${results.item.imgName}`,
							(err) => {
								if (err) {
									console.log(err);
								} else {
									console.log(
										`Old image file deleted: ${results.item.imgName}`
									);
								}
							}
						);
					}
				}
				if (!errors.isEmpty()) {
					if (req.file) {
						fs.unlink(
							`public/uploads/images/${req.file.filename}`,
							(err) => {
								if (err) {
									console.log(err);
								} else {
									console.log(
										`Update item form errors. \nNew file from form deleted: ${req.file.filename}`
									);
								}
							}
						);
					}
					console.log(errors.array());
					res.render('item_form', {
						title: 'Update item',
						item: itemUpdate,
						category_list: results.category_list,
						errors: errors.array(),
					});
					return;
				}
				Item.findByIdAndUpdate(
					req.params.itemid,
					itemUpdate,
					(err, updatedItem) => {
						if (err) {
							return next(err);
						}
						res.redirect(
							`/catalog/${updatedItem.category}${updatedItem.url}`
						);
					}
				);
			}
		);
	},
];
