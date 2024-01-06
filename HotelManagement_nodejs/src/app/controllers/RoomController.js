const db = require('../../config/db/index.js');
const Room = db.room;
const fs = require('fs');
const path = require('path');

class RoomController {

    //[GET] /room
    async index(req, res, next) {
        try {
            const rooms = await Room.findAll({});
            const tempRooms = [];
            rooms.forEach(room => {
                const data = {
                    room_id: room.ID,
                    name: room.NAME,
                    address: room.ADDRESS,
                    description: room.DESCRIPTION,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt
                };
                tempRooms.push(data);
            });

            res.status(201).json({
                message: "Get rooms successful",
                data: tempRooms
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /room/:id
    async getRoomById(req, res, next) {
        try {
            const { roomId } = req.params;

            const room = await Room.findByPk(roomId);
            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            }

            res.status(201).json({
                message: "Get room successful",
                data: {
                    room_id: room.ID,
                    hotel_id: room.HOTEL_ID,
                    room_type_id: room.ROOM_TYPE_ID,
                    availability: room.AVAILABILITY,
                    description: room.description,
                    name: room.NAME,
                    image: typeof room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${room.IMAGE.filename}` : room.IMAGE,
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt 
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[POST] /room/create
    async addRoom(req, res, next) {
        try {
            const { hotelId, roomTypeId, availability, description, name } = req.body;

            let pathToCheck = path.join(__dirname, '../../public/img/' + req.file.filename);
            if (!fs.existsSync(pathToCheck)) {
                return res.render('error404');
            };

            var room = {
                HOTEL_ID: hotelId,
                ROOM_TYPE_ID: roomTypeId,
                AVAILABILITY: availability,
                DESCRIPTION: description,
                NAME: name,
                IMAGE: req.file
            };
            let created_room = await Room.create(room);

            res.status(201).json({
                message: "Add room successful",
                data: {
                    room_id: created_room.ID,
                    hotel_id: created_room.HOTEL_ID,
                    room_type_id: created_room.ROOM_TYPE_ID,
                    availability: created_room.AVAILABILITY,
                    description: created_room.DESCRIPTION,
                    name: created_room.NAME,
                    IMAGE: `${req.protocol}://${req.headers.host}/img/${req.file.filename}`,
                    createdAt: created_room.createdAt,
                    updatedAt: created_room.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /room/update/:roomId
    async updateRoom(req, res, next) {
        try {
            const { hotelId, roomTypeId, availability, description, name } = req.body;
            const { roomId } = req.params;

            let image;
            if (req.files.length > 0) {
                let pathToCheck = path.join(__dirname, '../../public/img/' + req.files[0].filename);
                if (!fs.existsSync(pathToCheck)) {
                    return res.render('error404');
                }
                image = req.files[0];
            } else {
                image = req.body.file;
            }

            const room = await Room.findByPk(roomId);
            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            }

            var roomUpdate = {
                HOTEL_ID: hotelId,
                ROOM_TYPE_ID: roomTypeId,
                AVAILABILITY: availability,
                DESCRIPTION: description,
                NAME: name,
                IMAGE: image
            };
            await room.update(roomUpdate);
            const updated_room = await room.save();

            res.status(201).json({
                message: "Update room successful",
                data: {
                    room_id: updated_room.ID,
                    hotel_id: updated_room.HOTEL_ID,
                    room_type_id: updated_room.ROOM_TYPE_ID,
                    availability: updated_room.AVAILABILITY,
                    description: updated_room.description,
                    name: updated_room.NAME,
                    IMAGE: typeof updated_room.IMAGE === 'object' ? `${req.protocol}://${req.headers.host}/img/${req.files[0].filename}` : updated_room.IMAGE,
                    createdAt: updated_room.createdAt,
                    updatedAt: updated_room.updatedAt
                }
            });
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /room/delete/:roomId
    async deleteRoom(req, res, next) {
        try {
            const { roomId } = req.params;

            const room = await Room.findByPk(roomId);
            if (!room) {
                return res.status(401).json({ message: "Room not found" });
            };

            await room.destroy();

            res.status(201).json({
                message: "Delete room successful",
                roomId: roomId
            });
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new RoomController
