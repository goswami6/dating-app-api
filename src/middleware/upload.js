const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const profileDir = path.join(uploadDir, 'profile-pictures');
const galleryDir = path.join(uploadDir, 'gallery');

[uploadDir, profileDir, galleryDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File filter — allow images only
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, png, gif, webp) are allowed'), false);
    }
};

// ── Profile Picture upload ──────────────────────────────
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, profileDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${req.params.id}-${Date.now()}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const upload = multer({
    storage: profileStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Gallery upload ──────────────────────────────────────
const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, galleryDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${req.params.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

const galleryUpload = multer({
    storage: galleryStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

module.exports = { upload, galleryUpload };
