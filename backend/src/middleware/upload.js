const multer = require("multer");

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    const originalName = Buffer.from(
      file.originalname,
      "latin1"
    ).toString("utf8");

    const uniqueName =
      Date.now() + "-" + originalName;

    cb(null, uniqueName);
  }

});

const upload = multer({
  storage
});

module.exports = upload;