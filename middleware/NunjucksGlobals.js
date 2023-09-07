import db from "../db/surreal.js";

export default async(req, res, next) => {
	if(req.method == "GET"){
		const info = await db.queryFirst(`SELECT * FROM info`);
		req.app.settings.nunjucksEnv.addGlobal("error", req.session.error);
		req.app.settings.nunjucksEnv.addGlobal("message", req.session.message);
		req.app.settings.nunjucksEnv.addGlobal("success", req.session.success);
		req.app.settings.nunjucksEnv.addGlobal("info", info);
		req.session.error = null;
		req.session.message = null;
		req.session.success = null;
		req.session.save();
	}
	next();
};