'use strict';
module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('project', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true
            },
            active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
                allowNull: false
            },
            private: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                field: 'created_at',
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                field: 'updated_at',
                allowNull: false
            },
            authorId: {
                type: Sequelize.INTEGER,
                field: 'author_id',
                onDelete: 'CASCADE',
                references: {
                    model: 'user',
                    key: 'id',
                    as: 'author_id',
                }
            },
            projectCategoryId: {
                type: Sequelize.INTEGER,
                field: 'project_category_id',
                onDelete: 'CASCADE',
                references: {
                    model: 'project_category',
                    key: 'id',
                    as: 'project_category_id',
                }
            }
        }, {
            tableName: 'project',
            freezeTableName: true
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('project');
    }
};