import jwt from 'jsonwebtoken';

export const isLoggedIn = async (req,res,next) => {
    
    try{
        console.log(req.cookies);
        let token = req.cookies.token || "";
        console.log("Token found", token ? 'yes' : 'no');


        if(!token){
            console.log("No token found");
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_USER)
        console.log("Decoded token", decoded); // { id: 'user_id', iat: timestamp, exp: timestamp }

        req.user = decoded

        next()

    }catch(error){
        console.log('Error in auth middleware');
        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        })
    }
}

