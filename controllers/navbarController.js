const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');

exports.navbar_data = (req, res, next) => {
	const pathItems = req.path.slice(1).split('/');
	if (
		pathItems[2] == 'update' ||
		pathItems[2] == 'delete' ||
		req.path == '/catalog/category/create' ||
		req.path == '/catalog/item/create'
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
		async.parallel(
			{
				category_list: (cb) => {
					Category.find().exec(cb);
				},
				item: (cb) => {
					Item.findById(pathItems[2]).exec(cb);
				},
			},
			(err, results) => {
				if (err) {
					return next(err);
				}
				let modifiedPath = pathItems.filter((item) => item !== '');
				if (modifiedPath.length) {
					let temp;
					modifiedPath = modifiedPath.map((ele, i) => {
						if (
							ele == 'catalog' ||
							ele == 'category' ||
							ele == 'create' ||
							ele == 'item'
						) {
							return { name: ele, setPath: `/${ele}` };
						} else if (ele == 'delete' || ele == 'update') {
							return { name: ele, setPath: `./${ele}` };
						} else {
							if (modifiedPath.indexOf(ele) === 1) {
								temp = results.category_list.find((categ) => {
									return categ._id == ele;
								});
								return { name: temp.name, setPath: temp.url };
							} else if (modifiedPath.indexOf(ele) === 2) {
								return {
									name: results.item.name,
									setPath: `${temp.url}${results.item.url}`,
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
