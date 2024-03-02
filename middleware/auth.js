import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ").at(1);

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  if (!decoded) {
    console.log("jwt verification failed");
    req.isAuth = false;
    return next();
  }
  req.userId = decoded.userId;
  req.isAuth = true;
  next();
};

export default authMiddleware;
