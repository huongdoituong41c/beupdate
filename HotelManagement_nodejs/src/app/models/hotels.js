module.exports = (sequelize, Sequelize) => {
    const Hotel = sequelize.define("hotel", {
        ID: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        NAME: {
            allowNull: false,
            type: Sequelize.STRING
        },
        ADDRESS: {
            allowNull: false,
            type: Sequelize.STRING
        },
        DESCRIPTION: {
            allowNull: false,
            type: Sequelize.TEXT
        },
        IMAGE: {
            allowNull: false,
            type: Sequelize.JSON
        }
    }, {
        up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable("hotel", {
                ID: {
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true,
                    type: Sequelize.INTEGER
                },
                NAME: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                ADDRESS: {
                    allowNull: false,
                    type: Sequelize.STRING
                },
                DESCRIPTION: {
                    allowNull: false,
                    type: Sequelize.TEXT
                },
                IMAGE: {
                    allowNull: false,
                    type: Sequelize.JSON
                }
            });
        },
        down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('hotel');
        }
    });

    // Hotel.associate = (models) => {
    //     Hotel.hasMany(models.room, {
    //         foreignKey: 'HOTEL_ID',
    //     });
    // };
    
    return Hotel;
}
