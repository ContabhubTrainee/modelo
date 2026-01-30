const express = require("express");
const router = express.Router();

const authRoutes = require('./auth');
const companiesRoutes = require('./companies');





router.use('/auth', authRoutes);
router.use('/companies', companiesRoutes);





router.get("/", (req, res) => {
  res.send("API rodando!");
});

module.exports = router;
