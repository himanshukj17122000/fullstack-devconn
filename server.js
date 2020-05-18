const express = require('express')
const app = express()
const connectDB = require('./config/db')
const PORT = process.env.PORT || 5000;
const path = require('path')


//connect Database
connectDB()


//Init Middleware 
app.use(express.json({
    extended: false
}))
//Define routes 
app.use('/api/users', require('./config/routes/api/users'))
app.use('/api/profile', require('./config/routes/api/profile'))
app.use('/api/posts', require('./config/routes/api/posts'))
app.use('/api/auth', require('./config/routes/api/auth'))
app.use(express.static(__dirname));


// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}


app.listen(PORT, () => {
    console.log(`Listening at the port ${PORT}`)
})