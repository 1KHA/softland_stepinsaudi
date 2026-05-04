function checkOwnership(req, res, next) {
  const user = req.user;
const companyIdFromParams = parseInt(req.params.id);
  // 🔒 تحقق من وجود المستخدم
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized ❌"
    });
  }

  // 🔒 تحقق من الشركة
  if (user.company_id !== companyIdFromParams) {
    return res.status(403).json({
      message: "ما عندك صلاحية ❌"
    });
  }

  next();
}

module.exports = checkOwnership;