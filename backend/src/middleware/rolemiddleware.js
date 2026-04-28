function checkRole(role) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== role) {
      return res.status(403).json({
        message: "🚫 ما عندك صلاحية"
      });
    }

    next();
  };
}

module.exports = checkRole;