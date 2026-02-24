const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Accès refusé, pas de token" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Format du token invalide" });
    }

    const token = parts[1];


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.userId = decoded.id;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token invalide" });
  }
};