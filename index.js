const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const UserRoute = require('./routes/UserRoute')
const AlbumRoute = require('./routes/AlbumRoute')
const MediaRoute = require('./routes/MediaRoute')
const AdminRoute = require('./routes/AdminRoute')

const fileupload = require("express-fileupload");

dotenv.config()
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }))
app.use(fileupload());

app.use(cors({ credentials: true, origin: true }));

mongoose.connect(process.env.DB_URI)
  .then(async() => {
    console.log('Connected MongoDB')
  }).catch(err => {
    console.log('err', err)
  })


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `)
})

app.get('/', (req, res) => {
  res.send('Home');
});
app.use('/api/v1/user', UserRoute)
app.use('/api/v1/album', AlbumRoute)
app.use('/api/v1/media', MediaRoute)
app.use('/api/v1/admin', AdminRoute)