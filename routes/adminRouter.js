import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../db/surreal.js";


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileUploadPath = path.resolve(__dirname, "..", "public");

router.get("/admin", async (req, res) => {
	if (req.jwt.valid) {
		const boxes = await db.queryAll(`SELECT * FROM item`)
		const info = await db.queryFirst(`SELECT * FROM info`)
		const cert = await db.queryFirst(`SELECT * FROM cert`)
		return res.render("admin", { boxes, info , cert});
	}
	return res.render("adminauth");
});

//Write a code that adds item to db and upload images to public/img folder
router.post("/admin/addBox", async (req, res) => {
	for (let i = 0; i < req.files.icon.length; i++) {
	}
	let myImagePaths = [];

	for (let i = 0; i < req.files.icon.length; i++) {
		let filePath = path.resolve(fileUploadPath, "img", req.files.icon[i].name);
		myImagePaths.push("/img/" + req.files.icon[i].name);
		req.files.icon[i].mv(filePath, (err) => {
			if (err) {
				console.log(err);
			}
		});
	}

	await db.create("item", {
		name: req.body.name,
		shortDescription: req.body.shortDescription,
		longDescription: req.body.longDescription,
		type: req.body.type,
		imagePaths: myImagePaths,
		showId: generateId()
	})
	return res.redirect("/admin");
});

router.post("/admin/modifyBox", async (req, res) => {
	if (req.body.deleteBool == "delete") {
		await db.query(`DELETE FROM item WHERE id = "${req.body.id}"`);
		if (req.body.imagePath != "") {
			var imagePath = req.body.imagePath.split(",");
			for (let i = 0; i < imagePath.length; i++) {
				if (imagePath != "") {
					let filePath = path.resolve(fileUploadPath + imagePath[i].replace("/", "\\"));
					if (fs.existsSync(filePath.trim())) {
						fs.unlinkSync(filePath.trim(), (err) => {
							if (err) {
								console.log(err);
							}
						});
					}
				}
			}
		}
	}
	if (req.body.deleteBool == "modify") {
		if (req.body.newFileBool == "true") {
			let myImagePaths
			if(req.body.imagePath.trim()!= ''){
				myImagePaths = req.body.imagePath.trim().split(",");
			}	
			else{
				myImagePaths = []
			}
			if (req.files.icon.name) {
				req.files.icon = [req.files.icon];
			}
			for (let i = 0; i < req.files.icon.length; i++) {
				req.files.icon[i].name.trim()
				if(req.files.icon[i].name!= ""){
					let filePath = path.resolve(fileUploadPath, "img", req.files.icon[i].name);
					myImagePaths.push("/img/" + req.files.icon[i].name);
					req.files.icon[i].mv(filePath, (err) => {
						if (err) {
							console.log(err);
						}
					});
				}
			}
			db.merge(`${req.body.id}`, {
				imagePaths: myImagePaths
			});
		}
		else{
			db.merge(`${req.body.id}`, {
				name: req.body.name,
				longDescription: req.body.longDescription,
				shortDescription: req.body.shortDescription,
				type: req.body.type
			});
		}
	}
	return res.redirect("/admin");
});
router.post("/admin/modifyInfo", async (req, res) => {
	await db.merge("info", {
		phoneNumber: req.body.phoneNumber,
		email: req.body.email
	});
	return res.redirect("/admin");
});
router.post("/admin/addcert", async (req, res) => { 
	let myCertPaths = [];
	if(req.body.imagePath.trim()!= ''){
		myCertPaths = req.body.imagePath.trim().split(",");
	}	
	else{
		myCertPaths = []
	}
	if (req.files.cert.name) {
		req.files.cert = [req.files.cert];
	}
	for (let i = 0; i < req.files.cert.length; i++) {
		let filePath = path.resolve(fileUploadPath, "cert", req.files.cert[i].name);
		myCertPaths.push("/cert/" + req.files.cert[i].name);
		req.files.cert[i].mv(filePath, (err) => {
			if (err) {
				console.log(err);
			}
		});
	}
	await db.merge("cert", {
		imagePaths: myCertPaths
	});
	return res.redirect("/admin");
});
router.post("/admin/deleteImage", async (req, res) => {

	let filePath = path.resolve(fileUploadPath + req.body.imageToDelete.replace("/", "\\"));

	if (req.body.imageToDelete != "") {
		let filePath = path.resolve(fileUploadPath + req.body.imageToDelete.replace("/", "\\"));
		if (fs.existsSync(filePath.trim())) {
			fs.unlinkSync(filePath.trim(), (err) => {
				if (err) {
					console.log(err);
				}
			});
		}
	}
	// если линукс менять на \\ на /
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath, (err) => {
			if (err) {
				console.log(err);
			}
		});
	}

	var imagePaths = req.body.deletePath.split(",");
	var id = req.body.deletePathId;

	await db.query(`UPDATE ${id} SET imagePaths = ['${imagePaths.join("','")}']`);

	return res.redirect("/admin");
});

router.post("/admin", async (req, res) => {
	// const [success] = await verifier.reCaptchaV3(req.body["g-recaptcha-response"], req.ip);

	const user = await db.queryFirst(`SELECT * FROM user WHERE username = "${req.body.username}"`);
	if (!user) {
		req.session.error = "Пользователь не найден!";
	}
	else if (!await bcrypt.compare(req.body.password, user.password)) {
		req.session.error = "Пароль неверный!";
	}
	else {
		delete user.password;
		res.jwt({
			user: { username: user.username }
		});
		const boxes = await db.queryAll(`SELECT * FROM item`)

		return res.render("admin", { boxes });
	}
	return res.render("adminauth");
});

export default router;
