const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

const UPLOAD_PASSWORD = "dinklefart288";

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        cb(null, Date.now() + "-" + safeName);
    }
});

const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "public")));

// Upload endpoint (password protected)
app.post("/upload", upload.single("video"), (req, res) => {
    const password = req.body.password;

    if (password !== UPLOAD_PASSWORD) {
        return res.status(401).send("Wrong password.");
    }

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    res.redirect("/");
});

// List videos
app.get("/videos", (req, res) => {
    fs.readdir("uploads", (err, files) => {
        if (err) return res.json([]);

        const videos = files.filter(f => /\.(mp4|mov|webm|mkv)$/i.test(f));
        res.json(videos);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
