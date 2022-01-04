const express = require('express');
const router = express.Router();
const path = require('path');

// Setup multer for handling file uploads
const multer = require('multer');
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'public/uploads/images/');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '__' + file.originalname);
	},
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 2000000 },
	fileFilter: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			let err = new Error('Only images (png, jpg, jpeg) are allowed.');
			err.status = 415;
			return cb(err);
		}
		cb(null, true);
	},
});

// Require controller modules
const nav_data_controller = require('../controllers/navDataController');
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

// Load data for displaying all categories as list and current directory as link in nav
router.use('/', nav_data_controller.category_list);
router.use('/', nav_data_controller.current_directory);

// GET request for home page
router.get('/', (req, res, next) => {
	res.render('index');
});

// GET request for catalog with all items
router.get('/catalog/', item_controller.item_list);

// GET request for creating category
router.get('/category/create', category_controller.category_create_get);

// POST request for creating category
router.post('/category/create', category_controller.category_create_post);

// GET request to delete category
router.get(
	'/catalog/:categoryid/delete',
	category_controller.category_delete_get
);

// POST request to delete category
router.post(
	'/catalog/:categoryid/delete',
	category_controller.category_delete_post
);

// GET request to update category
router.get(
	'/catalog/:categoryid/update',
	category_controller.category_update_get
);

// POST request to update category
router.post(
	'/catalog/:categoryid/update',
	category_controller.category_update_post
);

// GET request for category's items
router.get('/catalog/:categoryid/', item_controller.category_item_list);

// GET request for creating item
router.get('/item/create', item_controller.item_create_get);

// POST request for creating item
router.post(
	'/item/create',
	upload.single('picture'),
	item_controller.item_create_post
);

// GET request to delete item
router.get(
	'/catalog/:categoryid/:itemid/delete',
	item_controller.item_delete_get
);

// POST request to delete item
router.post(
	'/catalog/:categoryid/:itemid/delete',
	item_controller.item_delete_post
);

// GET request to delete item's image
router.get(
	'/catalog/:categoryid/:itemid/image-delete',
	item_controller.item_image_delete_get
);

// POST request to delete item's image
router.post(
	'/catalog/:categoryid/:itemid/image-delete',
	item_controller.item_image_delete_post
);

// GET request to update item
router.get(
	'/catalog/:categoryid/:itemid/update',
	item_controller.item_update_get
);

// POST request to update item
router.post(
	'/catalog/:categoryid/:itemid/update',
	upload.single('picture'),
	item_controller.item_update_post
);

// GET request for item's details page
router.get('/catalog/:categoryid/:itemid', item_controller.item_details);

module.exports = router;
