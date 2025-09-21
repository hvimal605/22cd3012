const express = require("express")
const app = express();
const db = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require('cors')

const dotenv = require("dotenv")
dotenv.config()

const urlRoutes = require("./routes/url")



const Port = process.env.PORT || 4000

db.connect()


//middlewares 
app.use(express.json())
app.use(cookieParser())





app.use("/api/v1/url",urlRoutes);


app.get('/',(req,res)=>{
       return res.json({
        success:true,
        messgae:"hello welcome to url shortner backend"
       })
})

app.listen(Port , ()=>{
  console.log(`the server is running on the ${Port} `)
})