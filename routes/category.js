const express = require('express');
const router = express.Router({ mergeParams: true });

const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

router.get('/', category_controller.category_index);

router.get('/item/:id/delete', item_controller.item_delete_get);

router.post('/item/:id/delete', item_controller.item_delete_post);

router.get('/item/:id/update', item_controller.item_update_get);

router.post('/item/:id/update', item_controller.item_update_post);

router.get('/item/:id', item_controller.item_details);

router.get('/item', (req, res, next) => {
	res.redirect('/');
});

module.exports = router;
