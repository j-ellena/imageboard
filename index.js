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
// get routes
// *****************************************************************************

app.get("/images", (req, res) => {
    db.getImages(0).then(images => {
        res.json(images);
    });
});

app.get("/image/:imageId", (req, res) => {
    db.getImage(req.params.imageId).then(image => {
        res.json(image);
    });
});

// app.get("/comments/:imageId", (req, res) => {
//     db.getComments(req.params.imageId).then(comments => {
//         res.json(comments);
//     });
// });

// *****************************************************************************
// post routes
// *****************************************************************************

app.post("/upload", handleFile, s3.upload, (req, res) => {
    console.log("app post upload");
    console.log("req.body: \n", req.body);
    console.log("req.file.filename: \n", req.file.filename);
    db.insertImage(
        config.s3Url + req.file.filename,
        req.body.username,
        req.body.title,
        req.body.description
    )
        //
        .then(image => {
            res.json({
                success: true,
                image: image
            });
        });
});

// app.post("/comments/:imageId", (req, res) => {});

// *****************************************************************************

app.listen(8080, () => console.log("...listening"));
