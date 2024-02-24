const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongoUrl)
    console.log('MongoDB Connected')
    // Create a text index on the 'name' field
    // await mongoose.connection.db.collection('users').createIndex({ name: 'text' });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

module.exports = connectDB
