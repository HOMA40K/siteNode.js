import db from "../db/surreal.js";
import fs from "fs";

export default async(req, res, next) => {
	var data;
	if(req.method == "GET"){
		var parsedData = JSON.parse(fs.readFileSync("data.json", "utf8"));
		var info = parsedData[1];
		var cert = parsedData[0];
		req.app.settings.nunjucksEnv.addGlobal("error", req.session.error);
		req.app.settings.nunjucksEnv.addGlobal("message", req.session.message);
		req.app.settings.nunjucksEnv.addGlobal("success", req.session.success);
		req.app.settings.nunjucksEnv.addGlobal("info", info);
		req.app.settings.nunjucksEnv.addGlobal("cert", cert);
		req.session.error = null;
		req.session.message = null;
		req.session.success = null;
		req.session.save();
	}
	next();
};