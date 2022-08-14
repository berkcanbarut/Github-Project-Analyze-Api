const express = require("express");
const router = express.Router();
const controller = require("../controller/controller");

router.get("/access/github",controller.getTokenGithub,controller.getLoginUser);
router.get("/user",controller.getAuthentication,controller.getUserInfo);
router.get("/project",controller.getAuthentication,controller.getProjectInfo);
router.get("/analyze",controller.getAuthentication,controller.getProjectClone);

module.exports = router;