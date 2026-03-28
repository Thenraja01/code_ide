require('dotenv').config();
const app = require('./main.js');

app.listen(process.env.PORT, () => {
  console.log(`Server running on ${process.env.PORT}`);
});
