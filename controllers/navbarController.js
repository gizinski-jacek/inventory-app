const Category = require('../models/category');
const Item = require('../models/item');
const async = require('async');

exports.navbar_data = (req, res, next) => {
	const pathItems = req.path.slice(1).split('/');
	async.parallel(
		{
			category_list: (cb) => {
				Category.find().exec(cb);
			},
			item: (cb) => {
				Item.findById(pathItems[3]).exec(cb);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			let modifiedPath = pathItems.filter((item) => item !== '');
			if (pathItems[1]) {
				modifiedPath[1] = results.category_list.find((cat) => {
					return cat._id == pathItems[1];
				});
			}
			if (results.item) {
				modifiedPath[3] = results.item;
			}
			if (modifiedPath.length) {
				let temp;
				modifiedPath = modifiedPath.map((ele, i) => {
					if (typeof ele === 'object') {
						if (!ele.category) {
							temp = ele;
							return { name: ele.name, setPath: ele.url };
						} else {
							return {
								name: ele.name,
								setPath: temp.url + ele.url,
							};
						}
					}
					if (i === 0) {
						return { name: ele, setPath: '/' + ele };
					} else if (i === 2) {
						return { name: ele, setPath: '../' };
					} else {
						return { name: ele, setPath: './' };
					}
				});
			}
			res.locals.category_list = results.category_list;
			res.locals.current_directory = modifiedPath;
			console.log(res.locals);
			next();
		}
	);
};
