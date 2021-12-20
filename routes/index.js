const express = require('express');
const router = express.Router();

const category_controller = require('../controllers/categoryController');

router.all('/', category_controller.category_list);

router.get('/category/create', (req, res, next) => {
	res.redirect('/catalog/category/create');
});

router.get('/item/create', (req, res, next) => {
	res.redirect('/catalog/item/create');
});

module.exports = router;
