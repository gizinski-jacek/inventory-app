const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	res.send('Catalog page');
	// res.render('index', { title: 'Home' });
});

module.exports = router;
