"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/************************************/
/*           DEPENDENCIES           */
/************************************/
const index_1 = require("./../../models/index");
/*************************************/
/*            COLOR QUERY            */
/*************************************/
exports.typeDef = `
    # Root Query
    extend type Query {
        getAllUiComponents: [UiComponent]
        getUiComponentById(id: ID!): UiComponent
    }
`;
exports.resolver = {
    Query: {
        getAllUiComponents(root, args) {
            // TODO: Aqui deberia llamar a un Service o una Api donde contenga
            // cada unos de los Request alusivos a 'uiComponent', haciendo el
            // try, catch, el manejo de errores, parseando los datos que sean
            // necesarios, etc.
            return index_1.models.UiComponent.findAll();
        },
        getUiComponentById(root, args) {
            return index_1.models.UiComponent.findById(args.id);
        },
    },
    UiComponent: {
        colorPalette(uiComponent) {
            return uiComponent.getColorPalette();
        },
    },
};
/*

Query de ejemplo:


query {
  getUiComponentById(id: 1) {
    id
    css
    scss
    html
    colorPalette {
      id
      colors {
        id
        hex
        label
      }
      category
      description
    }
  }
  
  getAllUiComponents {
    id
    css
    scss
    title
    html
    colorPalette {
      id
    }
  }
}
*/ 
//# sourceMappingURL=uiComponent.query.js.map