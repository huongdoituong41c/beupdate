const db = require('../../config/db/index.js');
const Booking = db.booking;
const nodemailer = require('nodemailer');
const jade = require('jade');

class BookingController {

    //[GET] /booking
    async index(req, res, next) {
        try {
            const bookings = await Booking.findAll({
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });
            const tempBookings = [];
            bookings.forEach(booking => {
                const data = {
                    booking_id: booking.ID,
                    user: booking.user.EMAIL,
                    room: booking.room.NAME,
                    checkInDate: booking.CHECK_IN_DATE,
                    checkOutDate: booking.CHECK_OUT_DATE,
                    numberOfGuests: booking.NUMBER_OF_GUESTS,
                    numberOfRooms: booking.NUMBER_OF_ROOMS,
                    totalPrice: booking.TOTAL_PRICE,
                    status: booking.confirmation_status.NAME,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                };
                tempBookings.push(data);
            });

            res.status(201).json({
                message: "Get bookings successful",
                data: tempBookings
            });
        } catch (error) {
            next(error)
        }
    }

    //[GET] /booking/userBooking
    async getBookingByUser(req, res, next) {
        try {
            const userId = req.user.ID;

            const bookings = await Booking.findAll({
                where: {
                    USER_ID: userId
                },
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            })

            const tempBookings = [];
            bookings.forEach(booking => {
                const data = {
                    booking_id: booking.ID,
                    user: booking.user.EMAIL,
                    room: booking.room.NAME,
                    checkInDate: booking.CHECK_IN_DATE,
                    checkOutDate: booking.CHECK_OUT_DATE,
                    numberOfGuests: booking.NUMBER_OF_GUESTS,
                    numberOfRooms: booking.NUMBER_OF_ROOMS,
                    totalPrice: booking.TOTAL_PRICE,
                    status: booking.confirmation_status.NAME,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                };
                tempBookings.push(data);
            });

            res.status(201).json({
                message: "Get booking of user successful",
                data: tempBookings
            });
        } catch (error) {
            next(error);
        }
    }

    //[POST] /booking/create
    async addBooking(req, res, next) {
        try {
            const { userId, roomId, checkInDate, checkOutDate, numberOfGuests, numberOfRooms, totalPrice } = req.body;

            var bk = {
                USER_ID: userId,
                ROOM_ID: roomId,
                CHECK_IN_DATE: checkInDate,
                CHECK_OUT_DATE: checkOutDate,
                NUMBER_OF_GUESTS: numberOfGuests,
                NUMBER_OF_ROOMS: numberOfRooms,
                TOTAL_PRICE: totalPrice,
                CONFIRMATION_STATUS_ID: 1
            }
            const created_booking = await Booking.create(bk)

            const booking = await Booking.findOne({
                where: { ID: created_booking.ID },
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });

            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            const room = await db.room.findByPk(booking.room.ID);
            await room.update({ AVAILABILITY: room.AVAILABILITY - booking.NUMBER_OF_ROOMS });
            await room.save();

            res.status(201).json({
                message: "Add booking successful",
                data: {
                    booking_id: booking.ID,
                    user: booking.user.EMAIL,
                    room: booking.room.ROOM,
                    checkInDate: booking.CHECK_IN_DATE,
                    checkOutDate: booking.CHECK_OUT_DATE,
                    numberOfGuests: booking.NUMBER_OF_GUESTS,
                    numberOfRooms: booking.NUMBER_OF_ROOMS,
                    totalPrice: booking.TOTAL_PRICE,
                    status: booking.confirmation_status.NAME,
                    createdAt: booking.createdAt,
                    updatedAt: booking.updatedAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    //[PATCH] /booking/updateStatus/:bookingId
    async updateStatus(req, res, next) {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            const { bookingStatusId } = req.body;
            if (bookingStatusId > 3) {
                return res.status(400).json({ message: "Status to update is invalid" });
            }

            if (req.user.ROLE !== 'Admin' && bookingStatusId === 2) {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }

            await booking.update({ CONFIRMATION_STATUS_ID: bookingStatusId });
            await booking.save();

            const updated_bookingStatus = await Booking.findByPk(booking.ID, {
                include: [
                    {
                        model: db.user,
                        as: 'user',
                    },
                    {
                        model: db.room,
                        as: 'room',
                        include: [
                            {
                                model: db.type_room,
                                as: 'typeRoom'
                            }
                        ]
                    },
                    {
                        model: db.confirmationStatus,
                        as: 'confirmation_status',
                    }
                ]
            });

            if (updated_bookingStatus.CONFIRMATION_STATUS_ID === 3) {
                const room = await db.room.findByPk(updated_bookingStatus.room.ID);
                await room.update({ AVAILABILITY: room.AVAILABILITY + updated_bookingStatus.NUMBER_OF_ROOMS });
                await room.save();

                return res.status(201).json({
                    message: "Update status booking successful",
                    data: {
                        booking_id: updated_bookingStatus.ID,
                        user: updated_bookingStatus.user.EMAIL,
                        room: updated_bookingStatus.room.ROOM,
                        checkInDate: updated_bookingStatus.CHECK_IN_DATE,
                        checkOutDate: updated_bookingStatus.CHECK_OUT_DATE,
                        numberOfGuests: updated_bookingStatus.NUMBER_OF_GUESTS,
                        numberOfRooms: updated_bookingStatus.NUMBER_OF_ROOMS,
                        totalPrice: updated_bookingStatus.TOTAL_PRICE,
                        status: updated_bookingStatus.confirmation_status.NAME,
                        createdAt: updated_bookingStatus.createdAt,
                        updatedAt: updated_bookingStatus.updatedAt
                    }
                });
            } else {
                try {
                    const Transporter = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                            user: "sonbui2522@gmail.com",
                            pass: "ewrfhjrdwcydpyfp",
                        },
                    });

                    await Transporter.sendMail({
                        from: "sonbui2522@gmail.com",
                        // to: `${updated_bookingStatus.user.EMAIL}`,
                        to: `dtcong@tma.com.vn`,
                        subject: "Approve booking",
                        html: `
                            h1 Your Booking is Confirmed!
                            p Dear [Guest Name],
                            p We're delighted to confirm your booking room!
                            p Here are the details of your reservation:
                            ul
                                li Guest Name: ${updated_bookingStatus.user.FIRSTNAME + "" + updated_bookingStatus.user.LASTNAME}
                                li Reservation Number: ${updated_bookingStatus.ID}
                                li Arrival Date: ${updated_bookingStatus.CHECK_IN_DATE}
                                li Departure Date: ${updated_bookingStatus.CHECK_OUT_DATE}
                                li Room Type: ${updated_bookingStatus.room.typeRoom.TYPE_NAME}
                                li Number of Guests: ${updated_bookingStatus.NUMBER_OF_GUESTS}
                                li Number of Rooms: ${updated_bookingStatus.NUMBER_OF_ROOMS}
                                li Total Price: ${updated_bookingStatus.TOTAL_PRICE}
                            p We look forward to welcoming you soon!
                        `,
                    });
                } catch (error) {
                    console.error("Error sending email:", emailError);
                    return res.status(500).json({ message: "Failed to send email" });
                }

                res.status(201).json({
                    message: "Update status booking successful",
                    data: {
                        booking_id: updated_bookingStatus.ID,
                        user: updated_bookingStatus.user.EMAIL,
                        room: updated_bookingStatus.room.ROOM,
                        checkInDate: updated_bookingStatus.CHECK_IN_DATE,
                        checkOutDate: updated_bookingStatus.CHECK_OUT_DATE,
                        numberOfGuests: updated_bookingStatus.NUMBER_OF_GUESTS,
                        numberOfRooms: updated_bookingStatus.NUMBER_OF_ROOMS,
                        totalPrice: updated_bookingStatus.TOTAL_PRICE,
                        status: updated_bookingStatus.confirmation_status.NAME,
                        createdAt: updated_bookingStatus.createdAt,
                        updatedAt: updated_bookingStatus.updatedAt
                    }
                });
            }
        } catch (error) {
            next(error);
        }
    }

    //[DELETE] /booking/delete/:bookingId
    async deleteBooking(req, res, next) {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(401).json({ message: "Booking not found" });
            }

            await booking.destroy();

            res.status(201).json({
                message: "Delete booking successful",
                bookingId: bookingId
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new BookingController
