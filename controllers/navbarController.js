const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');
const mongoose = require('mongoose');

exports.navbar_data = (req, res, next) => {
	if (
		req.path.includes('/uploads/images') ||
		req.path == '/category/create' ||
		req.path == '/item/create' ||
		req.path == '/'
	) {
		Category.find().exec((err, category_list) => {
			if (err) {
				return next(err);
			}
			res.locals.nav_category_list = category_list;
			res.locals.nav_current_directory = [];
			next();
		});
	} else {
		const pathItems = req.path
			.slice(1)
			.split('/')
			.filter((item) => item !== '');
		async.parallel(
			{
				category_list: (cb) => {
					Category.find().exec(cb);
				},
				item: (cb) => {
					if (mongoose.Types.ObjectId.isValid(pathItems[2])) {
						Item.findById(pathItems[2]).exec(cb);
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
					let categ;
					modifiedPath = pathItems.map((ele) => {
						if (ele == 'catalog') {
							return { name: ele, setPath: `/${ele}` };
						} else if (
							ele == 'delete' ||
							ele == 'update' ||
							ele == 'image-delete'
						) {
							return { name: ele, setPath: `` };
						} else {
							if (pathItems.indexOf(ele) === 1) {
								categ = results.category_list.find((cat) => {
									return cat._id == ele;
								});
								return {
									name: categ.name,
									setPath: categ.url,
								};
							} else if (
								pathItems.indexOf(ele) === 2 &&
								results.item
							) {
								return {
									name: results.item.name,
									setPath: `${categ.url}${results.item.url}`,
								};
							}
						}
					});
				}
				res.locals.nav_category_list = results.category_list;
				res.locals.nav_current_directory = modifiedPath;
				next();
			}
		);
	}
};
