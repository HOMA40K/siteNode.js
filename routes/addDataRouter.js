import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { Logger } from "./../utils/logger.js";
import db from "../database/surreal.js";


const router = express.Router();
const logger = new Logger();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileUploadPath = path.resolve(__dirname, "..", "public", "img", "server");

router.post("/server/add", async (req, res) => {
	if(!req.jwt.payload.user.permissions.includes("admin")){
		return res.render("error");
	}
	
	let err = false;

	if(req.files && req.files.icon){
		if(await req.files.icon.mimetype == "image/png"){
			let filePath = path.resolve(fileUploadPath, req.body.name + ".png");
			req.files.icon.mv(filePath, (err) => {
				if(err){
					req.session.error = "Ошибка сервера, попробуйте позже!";
					err = true;
				}
			});
		}
		else{
			req.session.error = "Формат файла может быть только PNG!";
			err = true;
		}
	}
	else{
		req.session.error = "Картинка сервера не найдена!";
		err = true;
	}
	
	if(!err){
		await db.create("server", {
			name: req.body.name,
			version: req.body.version,
			description: req.body.description,
			status: 0,
			mods: [],
			ip: req.body.ip,
			port: req.body.port,
			icon: `/img/server/${req.body.name}.png`
		});
		req.session.success = "Сервер успешно создан!";
	}
	return res.redirect("/admin");
});