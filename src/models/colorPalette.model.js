"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*****************************************/
/*          COLOR PALETTE MODEL          */
/*****************************************/
function default_1(sequelize, dataTypes) {
    let ColorPalette = sequelize.define('ColorPalette', {
        category: {
            type: dataTypes.STRING,
            allowNull: true
        },
        description: {
            type: dataTypes.TEXT,
            allowNull: true
        },
    }, {
        timestamps: true,
        tableName: 'colorPalette',
        freezeTableName: true,
    });
    /*      CREATE RELATIONSHIP      */
    /*********************************/
    ColorPalette.associate = (models) => {
        ColorPalette.hasMany(models.Color, {
            foreignKey: 'colorPaletteId',
            as: 'color'
        });
        ColorPalette.belongsTo(models.UiComponent, {
            foreignKey: 'uiComponentId',
            onDelete: 'CASCADE'
        });
    };
    return ColorPalette;
}
exports.default = default_1;
//# sourceMappingURL=colorPalette.model.js.map