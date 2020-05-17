const mongoose = require('mongoose')

const db = process.env.mongoURI


const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log('MongoDB connected....')
    } catch (err) {
        console.log(err.message)
        process.exit(1)
    }
}

module.exports = connectDB