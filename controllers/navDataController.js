const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const mongoose = require('mongoose');

// Get all categories from database and save in res.locals for use in nav
exports.category_list = (req, res, next) => {
	Category.find().exec((err, category_list) => {
		if (err) {
			return next(err);
		}
		res.locals.nav_category_list = category_list;
		next();
	});
	return;
};

// Get current directory from req.path and display it as links in nav on most pages
exports.current_directory = (req, res, next) => {
	if (req.path == '/' || req.path.includes('/create')) {
		res.locals.nav_current_directory = [];
		return next();
	} else if (req.path == '/catalog') {
		res.locals.nav_current_directory = [
			{ name: 'catalog', link: `/catalog` },
		];
		return next();
	} else {
		const pathElements = req.path.split('/').filter((item) => item !== '');
		async.parallel(
			{
				category_list: (cb) => {
					if (mongoose.Types.ObjectId.isValid(pathElements[1])) {
						Category.find().exec(cb);
					} else {
						let err = new Error('Invalid category ObjectId');
						err.status = 404;
						return next(err);
					}
				},
				item: (cb) => {
					if (mongoose.Types.ObjectId.isValid(pathElements[2])) {
						Item.findById(pathElements[2])
							.populate('category')
							.exec(cb);
					} else {
						cb();
					}
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				if (pathElements.length) {
					res.locals.nav_current_directory = pathElements
						.map((ele, index) => {
							if (ele == 'catalog') {
								return { name: ele, link: `/${ele}` };
							} else if (
								ele == 'delete' ||
								ele == 'update' ||
								ele == 'image-delete'
							) {
								return { name: ele, link: '' };
							} else if (index === 1) {
								const found = results.category_list.find(
									(categ) => categ._id == ele
								);
								if (!found) {
									let err = new Error(
										'Category was not found'
									);
									err.status = 404;
									return next(err);
								}
								return {
									name: found.name,
									link: found.url,
								};
							} else if (index === 2 && results.item) {
								return {
									name: results.item.name,
									link: `${results.item.category.url}${results.item.url}`,
								};
							}
						})
						.filter((p) => p !== undefined);
				}
				next();
			}
		);
	}
};
