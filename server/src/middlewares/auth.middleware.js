import jwt from "jsonwebtoken";


const verifyToken = (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !(authHeader).startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    token = (authHeader).split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No Token authorization" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        console.log("The decoded user is: ", req.user);
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Token is not valid" });
    }
}

export default verifyToken