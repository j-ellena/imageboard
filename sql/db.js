const spicedPG = require("spiced-pg");

let db;
if (process.env.DATABASE_URL) {
    db = spicedPG(process.env.DATABASE_URL);
} else {
    db = spicedPG("postgres:postgres:postgres@localhost:5432/imageboard");
}

// *****************************************************************************

exports.getImages = function(id) {
    const params = [id];
    const q = `
            SELECT *
                FROM images
                WHERE id > $1
                ORDER BY created_at DESC
                LIMIT 12;
            `;

    return db.query(q, params).then(results => {
        return results.rows;
    });
};

exports.addImage = function(url, username, title, description) {
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
