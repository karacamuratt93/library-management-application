const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

require('./routes/routesMgr.js')(app);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
