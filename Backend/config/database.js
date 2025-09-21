const mongoose = require("mongoose")


exports.connect = () =>{
   mongoose.connect(process.env.MONGODB_URL).
   then(()=>{
    console.log("database connected successfully");
   }).catch((error)=>{
       console.log("Db connection failed");
        console.error(error)
        process.exit(1);

       
   })
}
