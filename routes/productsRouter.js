import express from "express";

import db from "../db/surreal.js"

const router = express.Router();

// router.get("products", async (req, res) => {
//     const products = await db.getProducts();
//     res.send(products);

    
// })
router.get("/product/:id", async (req, res)=> {
    let box = await db.queryFirst(`SELECT * FROM ${req.params.id}`)

    res.render("product", {box})
});

router.get("/category/:type", async (req, res) => {
    let products
    switch(req.params.type){
        case "raspredelitelnie":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "Распределительные щиты"`);
            res.render("category", {products});
            break;
        case "vzrivozashitnoe":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "Взрывозвщищеное оборудование"`);
            res.render("category", {products});
            break;
        case "19":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "19 “ стойки"`);
            res.render("category", {products});
            break;
        case "avtomotizatsii":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "Шкафы Автоматизации"`);
            res.render("category", {products});
            break;
        case "electoobogreva":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "Шкафы Электрообогрева"`);
            res.render("category", {products});
            break;
        case "pozarnie":
            products = await db.queryAll(`SELECT * FROM item WHERE type = "Пожарные щиты в соответсвии с 043 регламентом"`);
            res.render("category", {products});
            break;
    }
});

export default router;