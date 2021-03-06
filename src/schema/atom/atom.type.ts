/************************************/
/*               TYPE               */
/************************************/

export const typeDef = `
type Atom {
    id: ID!
    name: String
    description: String
    html: String
    css: String
    contextualBg: String
    stores: Int
    views: Int
    likes: Int
    comments: [Comment]
    libs: [Lib]
    download: String
    active: Boolean
    private: Boolean
    duplicated: Boolean
    author: User!
    owner: User!
    category: AtomCategory
    project: Project
}
`;

/* NOTE: Ponemos todas sus propiedades, hasta sus objetos anidados (si los necesito traer en algun momento). 
    al final cuando voy a hacer la Query, ahi omito las propiedades que no necesito, ejemplo: active, createdAt, etc */