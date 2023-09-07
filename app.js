import express from "express";
import nunjucks from "nunjucks";
import session from "express-session";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import FlashMessages  from "./middleware/NunjucksGlobals.js"
import fileUpload from "express-fileupload";
import jwt from "jwt-express";
// import {expressjwt as jwt} from "express-jwt";

//TODO поменять сертификаты на свои. Почту поменять✓, Номер телефона✓. Информация о контактах✓. Починить скролл✓.


import db, { initDB } from "./db/surreal.js";
import adminRouter from "./routes/adminRouter.js";
import productsRouter from "./routes/productsRouter.js"
import orderRouter from "./routes/orderRouter.js"


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

app.get('/products', (req, res)=>{
    res.render('products')

})


// import connectDB from './db/connect.js';

// routes
app.use("/", adminRouter);
app.use("/", productsRouter);
app.use("/", orderRouter);



const port = 3000
try {
    //await connectDB(process.env.)
} catch(error){

}
app.listen(port, console.log(`server started on http://localhost:${port}`))