const db = require('../../config/db/index.js')
const Hotel = db.hotel
const fs = require('fs');
const path = require('path')
const { Op } = require('sequelize');

class HotelController {

    //[GET] /hotel
    async index(req, res, next) {
        try {
            const hotels = await Hotel.findAll();
            const tempHotels = [];
            hotels.forEach(hotel => {
                const data = {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE.filename}`,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt
                };
                tempHotels.push(data);
            });

            res.status(201).json({
                message: "Get hotels successful",
                data: tempHotels
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /hotel/:hotelId
    async getHotelById(req, res, next) {
        try {
            const { hotelId } = req.params;

            const hotel = await Hotel.findByPk(hotelId);
            if (!hotel) {
                return res.status(401).json({ message: "Hotel not found" });
            }

            res.status(201).json({
                message: "Get hotel successful",
                data: {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE.filename}`,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /hotel/create
    async createHotel(req, res, next) {
        try {
            const { name, address, description } = req.body;

            let pathToCheck = path.join(__dirname, '../../public/img/' + req.file.filename);
            if (!fs.existsSync(pathToCheck)) {
                return res.render('error404');
            }

            var hotel = {
                NAME: name,
                ADDRESS: address,
                DESCRIPTION: description,
                IMAGE: req.file
            };
            let created_hotel = await Hotel.create(hotel);

            res.status(201).json({
                message: "Create hotel successful",
                data: {
                    hotel_id: created_hotel.ID,
                    name: created_hotel.NAME,
                    address: created_hotel.ADDRESS,
                    description: created_hotel.DESCRIPTION,
                    image: `${req.protocol}://${req.headers.host}/img/${req.file.filename}`,
                    createdAt: created_hotel.createdAt,
                    updatedAt: created_hotel.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /hotel/search?address=''&checkInDate=''&checkOutDate=''&typeRoom=''
    async searchHotels(req, res, next) {
        try {
            const { address, checkInDate, checkOutDate, typeRoom } = req.query;

            const hotels = await Hotel.findAll({
                where: {
                    ADDRESS: {
                        [Op.like]: `%${address}%`
                    }
                },
                include: [
                    {
                        model: db.room,
                        as: 'rooms',
                        where: {
                            ROOM_TYPE_ID: typeRoom,
                        }
                    }
                ]
            })

            const tempHotels = [];
            hotels.forEach(hotel => {
                const data = {
                    hotel_id: hotel.ID,
                    name: hotel.NAME,
                    address: hotel.ADDRESS,
                    description: hotel.DESCRIPTION,
                    image: `${req.protocol}://${req.headers.host}/img/${hotel.IMAGE.filename}`,
                    createdAt: hotel.createdAt,
                    updatedAt: hotel.updatedAt,
                };
                tempHotels.push(data);
            });

            res.status(201).json({
                message: "Search hotel successful",
                data: tempHotels
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new HotelController
