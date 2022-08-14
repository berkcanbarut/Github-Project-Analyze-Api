const express = require("express");
const app = express();
const apiRouter = require("./router/router");
const dotenv = require("dotenv");
var cookieParser = require('cookie-parser')

dotenv.config({
    path : "./config/conf.env"
})

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});


app.use(apiRouter);

app.listen(process.env.PORT,()=>{
    console.log("Server is running | Port :"+process.env.PORT);
})
