const express = require('express');
const router = express.Router();

const catalog_controller = require('../controllers/catalogController');
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

router.get('/', catalog_controller.catalog_index);

router.get('/item/create', item_controller.item_create_get);

router.post('/item/create', item_controller.item_create_post);

router.get('/category/create', category_controller.category_create_get);

router.post('/category/create', category_controller.category_create_post);

router.get('/category/:id/delete', category_controller.category_delete_get);

router.post('/category/:id/delete', category_controller.category_delete_post);

router.get('/category/:id/update', category_controller.category_update_get);

router.post('/category/:id/update', category_controller.category_update_post);

module.exports = router;
