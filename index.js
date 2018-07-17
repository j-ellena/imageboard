console.log("\x1Bc");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const db = require("./sql/db.js");

// *****************************************************************************
// middleware
// *****************************************************************************

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

// *****************************************************************************
// get routes
// *****************************************************************************

app.get("/images", (req, res) => {
    db.getImages().then(images => {
        res.json(images);
    });
});

// *****************************************************************************

app.listen(8080, () => console.log("...listening"));
