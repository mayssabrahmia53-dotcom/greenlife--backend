module.exports = (requiredRole) => {
  return (req, res, next) => {
    if (req.userRole !== requiredRole) {
      return res.status(403).json({
        message: "Accès interdit : rôle insuffisant"
      });
    }
    next();
  };
};