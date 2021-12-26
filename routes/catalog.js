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

const category_controller = require('../controllers/categoryController');
const item_controller = require('../controllers/itemController');

router.get('/', item_controller.item_list);

router.get('/category/create', category_controller.category_create_get);

router.post('/category/create', category_controller.category_create_post);

router.get('/:id/delete', category_controller.category_delete_get);

router.post('/:id/delete', category_controller.category_delete_post);

router.get('/:id/update', category_controller.category_update_get);

router.post('/:id/update', category_controller.category_update_post);

router.get('/item/create', item_controller.item_create_get);

router.post(
	'/item/create',
	upload.single('picture'),
	item_controller.item_create_post
);

router.get('/category', (req, res, next) => {
	res.redirect('./');
});

module.exports = router;
