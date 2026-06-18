import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

import express from 'express'
/*

(async() => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log('database connected');
        app.on('error', (error) => {
            console.log("ERRM ERROR: ",error);
        })

        app.listen(process.env.PORT, () => {
            console.log("APP RUNNING ON PORT ",process.env.PORT);
        })
    } catch(error) {
        console.log("ERROR:",error);
    }
})()

*/

import connect_db from "./db/connect_db.js";
import app from "./app.js";

const port = process.env.PORT || 8000

connect_db()
.then(() => {
    app.listen(port, () => {
        console.log("App listening on port ",port);
    })
})
.catch(err => {
    console.log("DB Connection failed!:  ",err);
})

app.listen(port,() => {
    console.log(`app listening on port ${port}`);
})