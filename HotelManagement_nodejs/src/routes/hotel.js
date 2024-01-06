var express = require('express')
var router = express.Router()
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/img');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const hotelController = require('../app/controllers/HotelController');
const { verifyToken, authorizeAdmin } = require('../app/middlewares');

// router.get('/show', hotelController.show)

router.post('/create', upload.single('file'), verifyToken, authorizeAdmin, hotelController.createHotel);

router.get('/search', hotelController.searchHotels);

router.get('/:hotelId', hotelController.getHotelById);

// Always at the bottom
router.get('/', hotelController.index);

module.exports = router
