import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import 'dotenv/config'

const connect_db = async() => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB Connection Successful: ",connectionInstance.connection.host);
    } catch (error) {
        console.log("DB COnnection failed: ",error);
        process.exit()
    }
}

export default connect_db