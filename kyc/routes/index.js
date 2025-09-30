const express = require("express")
const router = express.Router();
const businessRoute = require("./business.route")
const uploadRoute = require("./upload.route")
const individualRoute = require("./individual.route")
const authRoute = require("./auth.route")
const verifyAuth = require("../middlewares/auth.middleware")

router.use(verifyAuth)
router.use("/", individualRoute)
router.use("/", businessRoute)
router.use("/", uploadRoute)
router.use("/", authRoute)


module.exports = router