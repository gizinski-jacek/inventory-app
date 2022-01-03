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
		req.path.includes('/pictures') ||
		req.path.includes('/uploads') ||
		req.path.includes('/create')
	) {
		res.locals.nav_current_directory = [];
		return next();
	} else if (req.path == '/catalog') {
		res.locals.nav_current_directory = [
			{ name: 'catalog', setPath: `/catalog` },
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
				let modifiedPath;
				if (pathItems.length) {
					modifiedPath = pathItems.map((ele, index) => {
						if (ele == 'catalog') {
							return { name: ele, setPath: `/${ele}` };
						} else if (
							ele == 'delete' ||
							ele == 'update' ||
							ele == 'image-delete'
						) {
							return { name: ele, setPath: '' };
						} else {
							if (index === 1) {
								return results.category_list.find((cat) => {
									if (cat._id == ele) {
										return {
											name: ele.name,
											setPath: ele.url,
										};
									}
								});
							} else if (index === 2 && results.item) {
								return {
									name: results.item.name,
									setPath: `${results.item.category.url}${results.item.url}`,
								};
							}
						}
					});
					modifiedPath = modifiedPath.filter((p) => p !== undefined);
				}
				res.locals.nav_current_directory = modifiedPath;
				next();
			}
		);
	}
};
