const express = require("express");

const cartController = require("../controllers/cart");

const router = express.Router();

router.get("/cart", cartController.getCart);
router.post("/cart", cartController.postCart);
router.post("/update-cart-item", cartController.postUpdateCartItem);
router.post("/delete-cart-item", cartController.postDeleteCartItem);

module.exports = router;
