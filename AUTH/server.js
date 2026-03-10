require('dotenv').config();
const app = require('./src/app')
const connectDb = require('./src/db/db')


connectDb();

app.listen(3000, ()=>{
    console.log('Server is running at port 3000')
})