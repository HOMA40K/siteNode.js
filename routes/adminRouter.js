import express from "express";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { Logger } from "./../utils/logger.js";
import db from "../db/surreal.js";

const logger = new Logger();

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileUploadPath = path.resolve(__dirname, "..", "public");

router.get("/change_picture_format", async (req, res) => {
	var testFolder = path.resolve(fileUploadPath, "img");
	fs.readdir(testFolder, (err, files) => {
		files.forEach(file => {
			if (file.includes(".webp")) {
				1+1
			}
			else{
				sharp(path.resolve(testFolder, file))
				.toFile(`./public/img/${file.replace(".jpg", ".webp").replace(".png", ".webp")}`)
			}
			
		});
	});
	var boxes = await db.queryAll(`SELECT * FROM item`)
	boxes.forEach(box => {
		var newImagePathsArray = [];
		var imagePaths = box.imagePaths;
		imagePaths.forEach(image => {
			var newImagePaths = image.replace(".jpg", ".webp").replace(".png", ".webp");
			newImagePathsArray.push(newImagePaths);
		});
		db.merge(`${box.id}`, {
			imagePaths: newImagePathsArray
		});
	});
	return res.redirect("/admin");
});


router.get("/admin", async (req, res) => {
	if (req.jwt.valid) {
		const boxes = await db.queryAll(`SELECT * FROM item`)
		const info = await db.queryFirst(`SELECT * FROM info`)
		const cert = await db.queryFirst(`SELECT * FROM cert`)
		return res.render("admin", { boxes, info, cert });
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
				logger.log(err);
			}
		});
	}
	function generateId() {
		let id = "";

		for (let i = 0; i < 5; i++) {
			id += Math.floor(Math.random() * 10);
		}
		if (checkId(id)) {
			return id;
		}

	}
	//Check if any of items has the same id as generated id
	function checkId(checkId) {
		const items = db.select("item");
		for (let i = 0; i < items.length; i++) {
			if (items[i].showId == checkId) {
				return false;
			}
		}
		return true;
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
								logger.log(err);
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
			if (req.body.imagePath.trim() != '') {
				myImagePaths = req.body.imagePath.trim().split(",");
			}
			else {
				myImagePaths = []
			}
			if (req.files.icon.name) {
				req.files.icon = [req.files.icon];
			}
			for (let i = 0; i < req.files.icon.length; i++) {
				req.files.icon[i].name.trim()
				if (req.files.icon[i].name != "") {
					let filePath = path.resolve(fileUploadPath, "img", req.files.icon[i].name);
					myImagePaths.push("/img/" + req.files.icon[i].name);
					req.files.icon[i].mv(filePath, (err) => {
						if (err) {
							logger.log(err);
						}
					});
				}
			}
			db.merge(`${req.body.id}`, {
				imagePaths: myImagePaths
			});
		}
		else {
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
		secondNumber: req.body.secondNumber,
		email: req.body.email,
		telegramm: req.body.telegramm,
		whattsup: req.body.whattsup
	});
	return res.redirect("/admin");
});
router.post("/admin/addcert", async (req, res) => {
	let myCertPaths = [];
	if (req.body.imagePath.trim() != '') {
		myCertPaths = req.body.imagePath.trim().split(",");
	}
	else {
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
				logger.log(err);
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
					logger.log(err);
				}
			});
		}
	}
	// если линукс менять на \\ на /
	if (fs.existsSync(filePath)) {
		fs.unlinkSync(filePath, (err) => {
			if (err) {
				logger.log(err);
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
