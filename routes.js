const express = require('express');
const router = express.Router();
const app = express();

// Doc To PDF
const docToPDF = require('./doctopdf/doctopdf');

router.use('/', docToPDF)

module.exports = router;