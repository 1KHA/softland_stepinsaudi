function checkRole(allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // لو جتك string نحولها array
    const roles = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: "Forbidden 🚫" });
    }

    next();
  };
}

module.exports = checkRole;