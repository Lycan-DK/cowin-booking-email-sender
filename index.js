
const nodemailer = require('nodemailer')
const request = require('request')
const moment = require('moment')
const config = require('./config.json')
let send_email_reminder = true



function get_data() {
    /** for covaxin : COVAXIN
     * for covishield: COVISHIELD
     */
    request(get_request_options(), function (err, res, body) {
        if (err) {
            console.log("Error occured : ", res.statusCode)
        }
        if (res.statusCode < 300) {
            let cowin_search_data = JSON.parse(body);
            let centers_list = cowin_search_data.centers
            for (let center of centers_list) {
                let center_name = center.address
                for (let session of center.sessions) {
                    if (session.min_age_limit < config.below_age) {
                        if (session.available_capacity > 0) {
                            if (config.dose == 1) {
                                if (session.available_capacity_dose1 > 0) {
                                    console.log("Send email : ", center_name, session.available_capacity, config.zipcode);
                                    if (send_email_reminder) {
                                        send_email(center_name, session.available_capacity, session.available_capacity_dose1, 0, config.zipcode).catch(console.error);
                                        send_email_reminder = false;
                                        set_email_reminder_true()
                                    }
                                }
                            }
                            else if (config.dose == 2) {
                                if (session.available_capacity_dose2 > 0) {
                                    console.log("Send email : ", center_name, session.available_capacity, config.zipcode);
                                    if (send_email_reminder) {
                                        send_email(center_name, session.available_capacity, 0, session.available_capacity_dose2, config.zipcode).catch(console.error);
                                        send_email_reminder = false;
                                        set_email_reminder_true()
                                    }
                                }
                            }
                            else {
                                console.log("No Suitable session found for settings :", config.zipcode, " below age: ", config.below_age)
                            }
                        } else {
                            console.log("No session found for settings :", config.zipcode, " below age: ", config.below_age)
                        }
                    }
                }
            }
        }
    })
}


async function send_email(center_name, available_capacity, available_capacity_dose1, available_capacity_dose2, pin_code) {
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

function get_request_options() {
    let date = moment().format('DD-MM-YYYY');
    let request_options = {
        url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${config.zipcode}&date=${date}`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        }
    };
    return request_options
}

setInterval(() => {
    get_data()
}, 60000)

function set_email_reminder_true() {
    setTimeout(() => {
        send_email_reminder = true
    }, 600000)
}