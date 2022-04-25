const express = require('express');
const path = require('path');
const cors = require('cors');
const router = require('./routes');
const app = express();
app.use(cors());

// router
app.use('/', router)

app.listen(8080, () => console.log('Listening on 8080...'));