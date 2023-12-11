const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const connectToDb = require('./connectToDb');
const User = require('./model');
const api2pdf = require('api2pdf');
const nodemailer = require('nodemailer');
const ejs = require('ejs');


const PORT = 3000;
const mongoURI = 'mongodb+srv://nandasajal208:NMUPGW5aycc266Wc@cluster0.uhjgxqh.mongodb.net/?retryWrites=true&w=majority';
const emailSender = 'sajal1232.be21@chitkara.edu.in'; 
const emailSenderPassword = 'Sajal123456789%'; 
const a2pClient = new api2pdf('88036ac0-8e6c-4161-9f17-7b4c38a895e9');
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');

connectToDb(mongoURI);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const generateCertificate = async (user) => {
    const pdfFileName = `certificate_${user.name.replace(/\s+/g, '_')}.pdf`;

    const htmlContent = await ejs.renderFile('certificate.ejs', { user });

    const pdfOptions = {
        inline: false,
        filename: pdfFileName,
    };

    try{
        const result = await a2pClient.wkHtmlToPdf(htmlContent, pdfOptions);
        const pdfUrl = result.FileUrl;
        user.pdfUrl = pdfUrl;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSender,
                pass: emailSenderPassword,
            },
        });

        const mailOptions = {
            from: emailSender,
            to: user.email,
            subject: '🌳 Your Tree-tastic Certification Has Arrived! 🌿',
            text: `Hey ${user.name}! 🌟\n\nHats off to you for being an eco-hero! 🌍 Your generosity is like sunshine for our planet. 🌞\n\nDrumroll, please... 🥁 Attached is your dazzling Tree Donation Certification! 🎉 Your $${user.amount} donation for planting ${user.noOfTrees} trees is a monumental contribution to our green revolution. 🌱\n\nReady to showcase your green thumb? 🌳 Click the link below to download your certificate and let the world know about your fantastic impact! 💚\n\nDownload Your Certificate: ${pdfUrl}\n\nKeep rocking the green vibes! 🌿\n\nCheers,\nThe Tree Tribe 🌲`,
        };
        

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

    }catch(err){
        console.log(err);
    }
};

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const userDataWithTrees = jsonData.map(user => ({
            ...user,
            noOfTrees: user.amount / 100,
        }));    

        const result = await User.insertMany(userDataWithTrees);

        for (const user of userDataWithTrees) {
            await generateCertificate(user);
        }

        res.status(200).send('Data successfully uploaded to MongoDB');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error ' + error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});