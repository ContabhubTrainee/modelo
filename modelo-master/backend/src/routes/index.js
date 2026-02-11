const express = require("express");
const router = express.Router();

const authRoutes = require('./auth');
const companiesRoutes = require('./companies');





router.use('/auth', authRoutes);
router.use('/companies', companiesRoutes);
router.use('/user-companies', require('./userCompanies'));
router.use('/goals', require('./goals'));
router.use('/projects', require('./projects'));
router.use('/messages', require('./messages'));





router.get("/", (req, res) => {
  res.send("API rodando!");
});

module.exports = router;
