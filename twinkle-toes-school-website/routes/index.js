const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Welcome to Twinkle Toes Schools API');
});

module.exports = router;
