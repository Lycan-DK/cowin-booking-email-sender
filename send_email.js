const nodemailer = require('nodemailer')
const config = require('./config.json')

async function send_email(center_name, available_capacity, available_capacity_dose1, available_capacity_dose2, pin_code) {
    /**
     * Can configure transporter settings as you like to send emails. currently set to gmail smtp
     */
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.email_user,
            pass: config.email_pass,
        },
    });

    let info = await transporter.sendMail({
        from: config.email_user,
        to: config.send_email_to, // list of receivers
        subject: "covid booking found ✔",
        html: `<b>booking is open for cowin  center: ${center_name}, 
        capicity: ${available_capacity}, 
        capicity_dose1: ${available_capacity_dose1},
        capicity_dose2: ${available_capacity_dose2},
        pin_code: ${pin_code} </b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);
}
module.exports = { send_email }