const path = require('path');
const express = require('express');
const morgan = require('morgan');
const handlebars = require('express-handlebars');
const bcrypt = require("bcryptjs");

const app = express();
const route = require('./routes/index.js');
const PORT = process.env.PORT || 8080;
const db = require('./config/db');
const cors = require("cors");

var corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

// Connect to DB
db.sequelize.authenticate()
  .then(() => {
    console.log('Connection to database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

db.sequelize.sync()
  .then(async () => {
    console.log('All models synced successfully');
    db.hotel.hasMany(db.room, {
      foreignKey: 'HOTEL_ID',
      as: 'rooms',
    });
    db.room.belongsTo(db.type_room, {
      foreignKey: 'ROOM_TYPE_ID',
      as: 'typeRoom'
    });
    db.user.hasMany(db.booking, {
      foreignKey: 'USER_ID',
      as: 'bookings'
    });
    db.booking.belongsTo(db.room, {
      foreignKey: 'ROOM_ID',
      as: 'room'
    });
    db.booking.belongsTo(db.confirmationStatus, {
      foreignKey: 'CONFIRMATION_STATUS_ID',
      as: 'confirmation_status'
    });
    db.booking.belongsTo(db.user, {
      foreignKey: 'USER_ID',
      as: 'user'
    });

    const existingUserCount = await db.user.count();
    if (existingUserCount === 0) {
      const salt = await bcrypt.genSalt(10);
      await db.user.create({
        FIRSTNAME: 'Default',
        LASTNAME: 'Admin',
        EMAIL: 'duongthecong2000@gmail.com',
        PASSWORD: await bcrypt.hash('Congduong@110920', salt),  // Replace with a secure password
        ROLE: 'Admin'  // Or any other desired default role
      });
      console.log('Default user created successfully!');
    } else {
      console.log('Default user already exists, skipping creation.');
    }

    const existingTypeRoom = await db.type_room.count();
    if (existingTypeRoom === 0) {
      await db.type_room.create({
        TYPE_NAME: "Single Room",
        PRICE_PER_NIGHT: 50000,
      });
      await db.type_room.create({
        TYPE_NAME: "Double Room",
        PRICE_PER_NIGHT: 100000,
      });
      await db.type_room.create({
        TYPE_NAME: "Family Room",
        PRICE_PER_NIGHT: 150000,
      });
      await db.type_room.create({
        TYPE_NAME: "Suite Room",
        PRICE_PER_NIGHT: 200000,
      });
      await db.type_room.create({
        TYPE_NAME: "Special Room",
        PRICE_PER_NIGHT: 300000,
      });
    } else {
      console.log('Default type room already exists, skipping creation.');
    }

    const existingStatus = await db.confirmationStatus.count();
    if (existingStatus === 0) {
      await db.confirmationStatus.create({
        NAME: "Pending",
      });
      await db.confirmationStatus.create({
        NAME: "Confirmed",
      });
      await db.confirmationStatus.create({
        NAME: "Cancelled",
      });
    } else {
      console.log('Default confirmation status already exists, skipping creation.');
    }
  })
  .catch(err => {
    console.error('Error syncing models: ', err);
  });

// HTTP logger
app.use(morgan('combined'))
// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', 'src/resource/views')
// Get image
app.use(express.static(path.join(__dirname, 'public')))

// Use middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Routes init
route(app)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
