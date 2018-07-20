const spicedPG = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPG(process.env.DATABASE_URL);
} else {
    db = spicedPG("postgres:postgres:postgres@localhost:5432/imageboard");
}

// *****************************************************************************
// images queries
// *****************************************************************************

// exports.getFirst = function(id) {
//     const params = [id];
//     const q = `
//             SELECT *, (
//                 SELECT id FROM images
//                 ORDER BY id ASC LIMIT 1)
//             as first_id FROM images
//             WHERE id < $1
//             ORDER BY id DESC
//             LIMIT 6;
//             `;
//
//     return db.query(q, params).then(results => {
//         return results.rows;
//     });
// };

exports.getImages = function(id) {
    const params = [id];
    const q = `
            SELECT *
                FROM images
                WHERE id > $1
                ORDER BY id DESC
                LIMIT 12;
            `;

    return db.query(q, params).then(results => {
        return results.rows;
    });
};

exports.getImage = function(id) {
    const params = [id];
    const q = `
            SELECT *
                FROM images
                WHERE id = $1;
            `;

    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

exports.insertImage = function(url, username, title, description) {
    const params = [url, username, title, description];
    const q = `
            INSERT INTO images (url, username, title, description)
                VALUES ($1, $2, $3, $4)
            RETURNING *;
            `;

    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

// *****************************************************************************
// comments queries
// *****************************************************************************

exports.insertComment = function(imageId, username, comment) {
    const params = [imageId, username, comment];
    const q = `
            INSERT INTO comments (image_id, username, comment)
                VALUES ($1, $2, $3)
            RETURNING *;
            `;

    return db.query(q, params).then(results => {
        return results.rows[0];
    });
};

exports.getComments = function(imageId) {
    const params = [imageId];
    const q = `
            SELECT *
                FROM comments
                WHERE image_id = $1
                ORDER BY id DESC
                LIMIT 6;
            `;

    return db.query(q, params).then(results => {
        return results.rows;
    });
};

// *****************************************************************************
