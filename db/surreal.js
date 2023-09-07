import Surreal from "surrealdb.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Logger } from "./../utils/logger.js";

dotenv.config();
const logger = new Logger();

let db_url = process.env.DATABASE_URL;
let db_user = process.env.DATABASE_USER;
let db_pass = process.env.DATABASE_PASSWORD;

const db = new Surreal(db_url);

db.queryFirst = queryFirst;
db.queryAll = queryAll;



async function queryFirst(queryString) {
	try {
		const query = await db.query(queryString);
		return query[0].result[0];
	} catch {
		return {};
	}
}

async function queryAll(queryString) {
	try {
		const query = await db.query(queryString);
		return query[0].result;
	} catch {
		return {};
	}
}

export async function initDB() {
	await db.use({ns: 'marmaks', db: 'marmaks'});
	try {
		logger.log("INFO", "Initializing database...");
		if (!db_user || !db_pass || !db_url) {
			throw new Error("DB_URL or DB_USERNAME or DB_PASSWORD not set");
		}
		await db.signin({
			user: db_user,
			pass: db_pass,
		})
			.then((res) => {
				logger.log("INFO", "Signed in to database", res);
			})
			.catch((err) => {
				logger.log("ERROR", "Error signing in to database", err);
			});
        
        
        const items = await db.select("item");
        if(items.length == 0){
            await db.create("item", {
				name: "somebox",
				shortDescription: "lorem 1",
				longDescription: "lorem 2",
				type: "box1",
				imagePaths : ["/img/serv1.png", "/img/serv2.png", "/img/serv3.png", "/img/serv4.png"]
            })
			await db.create("item", {
				name: "somebox",
				shortDescription: "lorem 1",
				longDescription: "lorem 2",
				type: "box1",
				imagePaths : ["/img/box1.png", "/img/box2.png","/img/box3.png","/img/box4.png"]
			})
                .then((res) => {
                    logger.log("INFO", "Created default item", res);
                });
        }
		const info = await db.select("info");
		if(info.length == 0){
			await db.create("info", {
				phoneNumber: "+7 (999) 999-99-99",
				email: "info@marmaks"
			});
		}
		const users = await db.select("user");
		if(users.length == 0){
			await db.create("user", {
				username: "admin",
				password: await bcrypt.hashSync("7%^?6Dl+o4rkt/+", 10)
			})
				.then((res) => {
					logger.log("INFO", "Created default user", res);
				});
		}
	} catch (err) {
		logger.log("ERROR", err);
	}
}
export default db;