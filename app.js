import express from "express";
import nunjucks from "nunjucks";
import filters from "nunjucks-filter"
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import FlashMessages  from "./middleware/NunjucksGlobals.js"
import fileUpload from "express-fileupload";
import jwt from "jwt-express";
import http from "http";
import https from "https";
import fs from "fs";
// import {expressjwt as jwt} from "express-jwt";


import db, { initDB } from "./db/surreal.js";
import adminRouter from "./routes/adminRouter.js";
import productsRouter from "./routes/productsRouter.js"
import orderRouter from "./routes/orderRouter.js"
import { Logger } from "./utils/logger.js";

const logger = new Logger();

const app = express();
dotenv.config();
initDB();


// all app.set
app.set("views", "./views");
app.set("view engine", "html");


//all app.use imports 


// app.use(
// 	jwt({
// 	  secret: "shhhhhhared-secret",
// 	  algorithms: ["HS256"],
// 	  credentialsRequired: false,
// 	}));

app.use(cookieParser());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));

app.use(jwt.init(process.env.JWT_SECRET, { cookie: "jwt",  }));
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload());

// all cfgs	
nunjucks.configure("views", {
	autoescape: true,
	express: app
});

// all middleware
app.use(FlashMessages);


// local routes

app.get('/', (req, res)=>{
    res.render('index')

})

app.get('/contact', (req, res)=>{
    res.render('contact')

})
app.get('/polzovatelskoe_soglasenie', (req, res)=>{
	res.render('parts/polzovatelskoe_soglasenie')

})

app.get('/products', (req, res)=>{
    res.render('products')

})


// import connectDB from './db/connect.js';

// routes
app.use("/", adminRouter);
app.use("/", productsRouter);
app.use("/", orderRouter);


var httpServer;
var httpsServer;

if(fs.existsSync("src/cert/privkey.pem")){
	var privateKey  = fs.readFileSync("src/cert/privkey.pem", "utf8");
	var certificate = fs.readFileSync("src/cert/cert.pem", "utf8");
	var credentials = {key: privateKey, cert: certificate};
	httpsServer = https.createServer(credentials, app);
}
else{
	logger.log("ERROR", "Certificate not found");
}

if(httpsServer){
	httpsServer.listen(process.env.HTTPS_PORT, () => {
		logger.log("INFO", `Https server is running on port: ${process.env.HTTPS_PORT}`);
	});
}

if(process.env.NODE_ENV === "development"){
	httpServer = http.createServer(app);
	httpServer.listen(process.env.HTTP_PORT, () => {
		logger.log("INFO", `Http server is running on http://localhost:${process.env.HTTP_PORT}`);
	});
}