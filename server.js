const express = require('express')
const app = express()
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000;


//connect Database
connectDB()
app.get('/', (req, res) => {
    res.send('API running')
})

//Init Middleware 
app.use(express.json({
    extended: false
}))
//Define routes 
app.use('/api/users', require('./config/routes/api/users'))
app.use('/api/profile', require('./config/routes/api/profile'))
app.use('/api/posts', require('./config/routes/api/posts'))
app.use('/api/auth', require('./config/routes/api/auth'))

app.listen(PORT, () => {
    console.log(`Listening at the port ${PORT}`)
})