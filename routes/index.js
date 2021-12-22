const express = require('express');
const router = express.Router();

const category_controller = require('../controllers/categoryController');

router.use('/', category_controller.category_list_index);

router.get('/', (req, res, next) => {
	res.render('index', {
		title: 'F1 Shop',
		nav_category_list: res.locals.nav_category_list,
	});
});

router.get('/category/create', (req, res, next) => {
	res.redirect('/catalog/category/create');
});

router.get('/item/create', (req, res, next) => {
	res.redirect('/catalog/item/create');
});

module.exports = router;
