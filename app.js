const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(`./dist/frontend`));
app.get('/*', function(req, res) {

    res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
  });
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Server up in Port 5000 ");
});