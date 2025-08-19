import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = () => {
    // console.log("MONGO_URI value:", process.env.MONGO_URI); 
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log("DB connected");
        })
        .catch((err) => console.log("Failed connecting to DB", err));
}

export default db;
