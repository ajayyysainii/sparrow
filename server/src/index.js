
import express from "express"
import cors from "cors"
import 'dotenv/config'
import connectDB from "./config/connectDB.js"
import MODULE_ROUTE_MAPPING from "./app.js";
import morgan from 'morgan'
import Call from "./models/call.model.js";
import { pollAndSyncVapiCalls } from "./controllers/call.controller.js";


const app = express();
const port=process.env.PORT || 4000

connectDB();

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))
app.use(cors()) 
app.use(express.text({ type: "*/*" }));




app.get("/",(req,res)=>{
    console.log("Call Backend !!")
    res.send("Call Backend !!")
});

MODULE_ROUTE_MAPPING.forEach(({prefix,router})=>{
    app.use(prefix,router);
})

setInterval(pollAndSyncVapiCalls, 60000); // Poll every 2 seconds
pollAndSyncVapiCalls(); // Run once immediately on server start


app.listen(port, () => {
    console.log(`Server is Running! at Port ${port}`);
});
