const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/products", shopController.getProducts);
router.get("/products/:id", shopController.getProduct);
router.get("/product-colors/:id", shopController.getProductColors);
router.get("/cart", shopController.getCart);
router.post("/cart", shopController.postCart);

module.exports = router;
