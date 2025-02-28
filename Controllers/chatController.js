const chatModel = require("../Models/chatModel");

// Create Chat
const createChat = async (req, res) => {
    const { firstId, secondId } = req.body;

    try {
        const existingChat = await chatModel.findOne({ members: { $all: [firstId, secondId] } });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const newChat = new chatModel({ members: [firstId, secondId] });
        const savedChat = await newChat.save();
        res.status(200).json(savedChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// Find User Chats
const findUserChat = async (req, res) => {
    const userId = req.params.userId;

    try {
        const chats = await chatModel.find({ members: { $in: [userId] } });
        res.status(200).json(chats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// Find Chat Between Two Users
const findChat = async (req, res) => {
    const { firstId, secondId } = req.params;

    try {
        const chat = await chatModel.findOne({ members: { $all: [firstId, secondId] } });
        
        if (!chat) {
            return res.status(404).json({ error: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { createChat, findUserChat, findChat };
