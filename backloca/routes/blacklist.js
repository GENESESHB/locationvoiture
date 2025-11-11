const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklistController');
const auth = require('../middleware/auth');

router.post('/', auth, blacklistController.addToBlacklist);
router.get('/my-blacklist', auth, blacklistController.getMyBlacklist);
router.get('/check', auth, blacklistController.checkBlacklist);
router.delete('/:id', auth, blacklistController.removeFromBlacklist);

module.exports = router;
