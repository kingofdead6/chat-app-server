const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const fs = require("fs");
const path = require("path");

async function sendEmail(toEmail, name) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ny_kahlouche@esi.dz",
            pass: "vclc hypu acsu fghb",
        },
    });

    const templatePath = path.join(__dirname, "../Templates/emailTemplate.html");
    let emailHtml = fs.readFileSync(templatePath, "utf-8");

    emailHtml = emailHtml.replace("{{name}}", name);

    const mailOptions = {
        from: "your-email@gmail.com",
        to: toEmail,
        subject: "Welcome to Our Platform!",
        html: emailHtml, 
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

async function sendLoginEmail(toEmail, name, ipAddress) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ny_kahlouche@esi.dz",
            pass: "vclc hypu acsu fghb",
        },
    });

    const templatePath = path.join(__dirname, "../Templates/loginNotification.html");
    let emailHtml = fs.readFileSync(templatePath, "utf-8");

    emailHtml = emailHtml.replace("{{name}}", name).replace("{{ipAddress}}", ipAddress).replace("{{date}}", new Date().toLocaleString());

    const mailOptions = {
        from: "your-email@gmail.com",
        to: toEmail,
        subject: "New Login to Your Account",
        html: emailHtml,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Login notification email sent successfully");
    } catch (error) {
        console.error("Error sending login notification email:", error);
    }
}


const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET;
    return jwt.sign({ _id }, jwtkey, { expiresIn: '3d' });
}

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email address' });
        }
        if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
            return res.status(400).json({ message: 'Password must be strong.' });
        }

        user = new userModel({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();
        const token = createToken(user._id);

        try {
            await sendEmail(email, name);

            return res.status(201).json({ message: "User registered successfully. Email sent.", _id: user._id, name, email, token });
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            return res.status(500).json({ message: "User registered, but email failed to send.", _id: user._id, name, email, token });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = createToken(user._id);

        // Get IP address from request
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        // Send login email notification
        await sendLoginEmail(email, user.name, ipAddress);

        res.status(200).json({ message: "Logged in successfully!", _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json(error.message);
    }
};


const findUser = async (req, res) => {
        const userId = req.params.userId ;
        try {
            const user = await userModel.findById(userId);
            res.status(200).json(user);
        }catch {
            console.error(error);
            res.status(500).json(error.message);
        }

}

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json(error.message);
    }
}

module.exports = {registerUser , loginUser , findUser , getUsers };