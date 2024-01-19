const mongoose = require("mongoose");
require('dotenv').config({ path: '.env'});


mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connection successful");
}).catch((err) => console.log(err))

