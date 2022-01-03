const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const mongoose = require('mongoose');

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

exports.current_directory = (req, res, next) => {
	if (
		req.path == '/' ||
		// req.path.includes('/pictures') ||
		// req.path.includes('/uploads') ||
		req.path.includes('/create')
	) {
		res.locals.nav_current_directory = [];
		return next();
	} else if (req.path == '/catalog') {
		res.locals.nav_current_directory = [
			{ name: 'catalog', link: `/catalog` },
		];
		return next();
	} else {
		const pathItems = req.path.split('/').filter((item) => item !== '');
		async.parallel(
			{
				category_list: (cb) => {
					if (mongoose.Types.ObjectId.isValid(pathItems[1])) {
						Category.find().exec(cb);
					} else {
						let err = new Error('Invalid category ObjectId');
						err.status = 404;
						return next(err);
					}
				},
				item: (cb) => {
					if (mongoose.Types.ObjectId.isValid(pathItems[2])) {
						Item.findById(pathItems[2])
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
				if (pathItems.length) {
					res.locals.nav_current_directory = pathItems
						.map((ele, index) => {
							if (ele == 'catalog') {
								return { name: ele, link: `/${ele}` };
							} else if (
								ele == 'delete' ||
								ele == 'update' ||
								ele == 'image-delete'
							) {
								return { name: ele, link: '' };
							} else {
								if (index === 1) {
									const found = results.category_list.find(
										(categ) => categ._id == ele
									);
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
							}
						})
						.filter((p) => p !== undefined);
				}
				next();
			}
		);
	}
};
