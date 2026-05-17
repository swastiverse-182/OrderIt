const mongoose = require("mongoose");
 
const connectDatabase = async () => {
  const con = await mongoose.connect(process.env.DB_LOCAL_URI);
  console.log(`MongoDB Database connected with HOST: ${con.connection.host}`);
};
 
module.exports = connectDatabase;
 