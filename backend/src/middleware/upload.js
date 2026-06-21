const multer = require("multer");

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
console.log("ORIGINAL:", file.originalname);

    const originalName = Buffer.from(
      file.originalname,
      "latin1"
    ).toString("utf8");

      console.log("CONVERTED:", originalName);

    const uniqueName =
      Date.now() + "-" + originalName;

    cb(null, uniqueName);
  }

});

const upload = multer({
  storage
});

module.exports = upload;