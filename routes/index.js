const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './public/data/uploads/');
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + '-' + file.originalname);
	},
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 2000000 },
	fileFilter: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
			return cb(new Error('Only images (png, jpg, jpeg) are allowed'));
		}
		cb(null, true);
	},
});

const navbar_controller = require('../controllers/navbarController');
const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

router.use('/', navbar_controller.navbar_data);

router.get('/', (req, res, next) => {
	res.render('index', {
		title: 'F1 Shop',
	});
});

router.get('/catalog/', item_controller.item_list);

router.get('/catalog/category/create', category_controller.category_create_get);

router.post(
	'/catalog/category/create',
	category_controller.category_create_post
);

router.get('/catalog/item/create', item_controller.item_create_get);

router.post(
	'/catalog/item/create',
	upload.single('picture'),
	item_controller.item_create_post
);

router.get('/catalog/:id/delete', category_controller.category_delete_get);

router.post('/catalog/:id/delete', category_controller.category_delete_post);

router.get('/catalog/:id/update', category_controller.category_update_get);

router.post('/catalog/:id/update', category_controller.category_update_post);

router.get('/catalog/:id/', item_controller.category_item_list);

router.get('/catalog/:id/:itemid/delete', item_controller.item_delete_get);

router.post('/catalog/:id/:itemid/delete', item_controller.item_delete_post);

router.get('/catalog/:id/:itemid/update', item_controller.item_update_get);

router.post(
	'/catalog/:id/:itemid/update',
	upload.single('picture'),
	item_controller.item_update_post
);

router.get('/catalog/:id/:itemid', item_controller.item_details);

router.get('/category/create', (req, res, next) => {
	res.redirect('/catalog/category/create');
});

router.get('/item/create', (req, res, next) => {
	res.redirect('/catalog/item/create');
});

module.exports = router;
