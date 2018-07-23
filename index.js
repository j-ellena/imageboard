console.log("\x1Bc");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./sql/db.js");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const s3 = require("./s3");
const config = require("./config");

// *****************************************************************************
// middleware
// *****************************************************************************

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

const handleFile = uploader.single("file");

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// *****************************************************************************
// image routes
// *****************************************************************************

app.get("/images", (req, res) =>
    db
        .getImages(req.query.offset)
        .then(images => res.json(images))
        .catch(err => console.log("Error db.getImages: \n", err))
);

app.get("/image/:imageId", (req, res) =>
    db
        .getImage(req.params.imageId)
        .then(image => res.json(image))
        .catch(err => console.log("Error db.getImage): \n", err))
);

app.post("/uploadImage", handleFile, s3.upload, (req, res) =>
    db
        .insertImage(
            config.s3Url + req.file.filename,
            req.body.username,
            req.body.title,
            req.body.description
        )
        .then(image =>
            res.json({
                success: true,
                image: image
            })
        )
        .catch(err => console.log("Error db.insertImage: \n", err))
);

app.post("/deleteImage/:imageId", (req, res) =>
    db
        .deleteImage(req.params.imageId)
        .then(message => res.json(message))
        .catch(err => console.log("Error db.deleteImage: \n", err))
);

// *****************************************************************************
// comment routes
// *****************************************************************************

app.get("/comments/:imageId", (req, res) =>
    db
        .getComments(req.params.imageId)
        .then(comments => res.json(comments))
        .catch(err => console.log("Error db.getComments: \n", err))
);

app.post("/addComment/:imageId", (req, res) =>
    db
        .insertComment(req.params.imageId, req.body.username, req.body.comment)
        .then(comment => res.json(comment))
        .catch(err => console.log("Error db.insertComment: \n", err))
);

app.post("/deleteComment/:imageId/:commentId", (req, res) =>
    db
        .deleteComment(req.params.commentId)
        .then(message => res.json(message))
        .catch(err => console.log("Error db.deleteComment: \n", err))
);

// *****************************************************************************

app.listen(process.env.PORT || 8080, () => console.log("...listening"));
