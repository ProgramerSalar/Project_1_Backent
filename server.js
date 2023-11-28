
const mongoose = require('mongoose')
const express = require('express')
const { config } = require('dotenv')
const bodyParser = require('body-parser')
const morgan = require('morgan')
config({
    path:'./data/config.env',
})
const app = express()
app.get('/', (req, res, next) => {
    res.send('working')
})
const cors = require('cors')
app.options('*', cors())
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler.js')







// middleware
app.use(bodyParser.json())
app.use(morgan('tiny'))
// app.use(authJwt())
// app.use(errorHandler)
app.use('/public/uploads', express.static(__dirname + 'public/uploads'))




const api = process.env.API_URL



// Routes 
const categoriesRoutes =  require("./routes/categories.js")
const productsRoutes = require("./routes/products.js")
const userRoutes = require("./routes/user.js")
const orderRoutes = require('./routes/order.js')





app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/product`, productsRoutes );
app.use(`${api}/user`, userRoutes );
app.use(`${api}/order`, orderRoutes );


















app.listen(process.env.PORT, () => {
    console.log('server is Running......')
})



// database
const connectDB = async () => {
    try{
        const {connection} = await mongoose.connect(process.env.MONGO_URL)
        console.log('Database is connected.......')
    }
    catch(error){
        console.log(error)
        process.exit(1)
    }
}
connectDB()