const express = require('express');
const router = express.Router();

const navbar_controller = require('../controllers/navbarController');

router.use('/', navbar_controller.navbar_data);

router.get('/', (req, res, next) => {
	res.render('index', {
		title: 'F1 Shop',
		nav_category_list: res.locals.category_list,
		nav_current_directory: res.locals.current_directory,
	});
});

router.get('/category/create', (req, res, next) => {
	res.redirect('/catalog/category/create');
});

router.get('/item/create', (req, res, next) => {
	res.redirect('/catalog/item/create');
});

module.exports = router;
