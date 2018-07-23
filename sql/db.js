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

exports.getImages = function(offset) {
    const params = [offset];
    const q = `
            SELECT * FROM (
                SELECT * FROM images ORDER BY id DESC)
                AS results
                LIMIT 12
                OFFSET $1
            `;
    return db.query(q, params).then(results => {
        return results.rows;
    });
};

exports.getImage = function(id) {
    const params = [id];
    const q = `
            SELECT *,
                (SELECT id FROM images WHERE id < $1
                    ORDER BY id DESC LIMIT 1)
                    as older,
                (SELECT id FROM images WHERE id > $1
                    ORDER BY id ASC LIMIT 1)
                    as newer
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

exports.deleteImage = function(id) {
    const params = [id];
    const q = `
            DELETE FROM images
                WHERE id = $1;
            `;
    return db.query(q, params).then(() => {
        return "Image successfully deleted.";
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

exports.deleteComment = function(id) {
    const params = [id];
    const q = `
            DELETE FROM comments
                WHERE id = $1;
            `;
    return db.query(q, params).then(() => {
        return "Comment successfully deleted.";
    });
};

// *****************************************************************************
