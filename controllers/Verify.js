const jwt =require("jsonwebtoken");
module.exports.VerifyToken = (req, res, next) => {
        const token = req.headers.authorization;
        if (token) {
            const accessToken = token.split(" ")[1];
            jwt.verify(accessToken, process.env.JWT_SECRET, (err, data) => {
                if (err) {
                    return res.status(400).json({message:"Wrong Token"});
                }
                req.auth = data;
                next();
            })          
        } else {
            return res.status(400).json({message:"Empty Token"});
        }    
}

module.exports.VerifyTokenOfAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        const accessToken = token.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, data) => {
            if (err) return res.status(400).json({message:"Wrong Token"});

            if(data.role === "ADMIN"){
                req.auth = data
                next();
            }   
            else
                return req.status(403).json({message:"Forbidden"})
        })          
    } else {
        return res.status(400).json({message:"Empty Token"});
    }    
}