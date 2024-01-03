const express = require("express");

const productController = require("../controllers/product");

const router = express.Router();

router.get("/products", productController.getProducts);
router.get("/products/:id", productController.getProduct);
router.get("/product-colors/:id", productController.getProductColors);

module.exports = router;
