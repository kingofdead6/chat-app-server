const express = require('express'); 
const cors = require('cors');
const mongoose = require('mongoose');
const userRoute = require('./Routes/userRoute');
const chatRoute = require('./Routes/chatRoute');
const messageRoute = require('./Routes/messageRoute');
mongoose.set('strictQuery', true);


const app = express();
require('dotenv').config();


app.use(express.json());
app.use(cors());
app.use('/api/users', userRoute);
app.use('/api/chats', chatRoute);
app.use('/api/messages', messageRoute);

app.get("/" , (req , res) => {
    res.send('Welcome to the chat app');
});

const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.listen(port, (req , res) => {
    console.log(`Server is running on port : ${port}`);
});


mongoose.connect(uri , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch((error) => console.error("MongoDB connection error: ", error.message));
