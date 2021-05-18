
const request = require('request')
const moment = require('moment')

const { send_email } = require('./send_email')
const config = require('./config.json')


let zipcode_email_tracker_data = {};
function zipcode_email_tracker() {
    /**
     * This function creates populate zipcode_email_tracker_data. 
     * This object tracks whether you have already sent email for cowin search for zipcode or not. helps in avoiding overflooding of emails
     */
    for (let zipcode of config.zipcode) {
        zipcode_email_tracker_data[`${zipcode}`] = true
    }
}
zipcode_email_tracker()

function search_cowin_data_for_zipcode(zipcode) {
    /** 
     * This function makes HTTP request to cowin api and get data based on zip code 
     * Thse filters can be later added for search of specific dose covishield: COVISHIELD for covaxin : COVAXIN
     */
    request(get_request_options(zipcode), async function (err, res, body) {
        if (err) {
            console.log("Error occured : ", err)
        }
        if (res.statusCode < 400) {
            let cowin_search_data = JSON.parse(body);
            let centers_list = cowin_search_data.centers
            let email_sent_in_this_session_search = false
            for (let center of centers_list) {
                let center_name = center.address
                for (let session of center.sessions) {
                    if (await check_session_conditions(center_name, session, zipcode)) {
                        email_sent_in_this_session_search = true
                    }
                }
            }
            if (email_sent_in_this_session_search) {
                zipcode_email_tracker_data[`${zipcode}`] = false
                set_email_reminder_true(zipcode)
            }
        }
    })
}

function check_session_conditions(center_name, session, zipcode) {
    /**
     * This functions check all the condition required to send email and triggers send email function
     * returns : boolean based on email is sent or not
     */
    let email_sent_in_this_session_search = false
    if (session.min_age_limit < config.below_age) {
        if (session.available_capacity > 0) {
            if (config.dose == 1) {
                if (session.available_capacity_dose1 > 0 && config.vaccine_list.includes(session.vaccine)) {
                    console.log("Send email : ", center_name, session.available_capacity, zipcode);
                    if (zipcode_email_tracker_data[`${zipcode}`]) {
                        send_email(center_name, session.available_capacity, session.available_capacity_dose1, 0, zipcode).catch(console.error);
                        email_sent_in_this_session_search = true;
                    }
                } else {
                    console.log("Dose1 not available : ", center_name, session.available_capacity, zipcode, session.vaccine)
                }
            }
            else if (config.dose == 2) {
                if (session.available_capacity_dose2 > 0 && config.vaccine_list.includes(session.vaccine)) {
                    console.log("Send email : ", center_name, session.available_capacity, zipcode);
                    if (zipcode_email_tracker_data[`${zipcode}`]) {
                        send_email(center_name, session.available_capacity, 0, session.available_capacity_dose2, zipcode).catch(console.error);
                        email_sent_in_this_session_search = true;
                    }
                } else {
                    console.log("Dose2 not available : ", center_name, session.available_capacity, zipcode, session.vaccine)
                }
            }
            else {
                console.log("No Suitable session found for settings :", zipcode, " below age: ", config.below_age)
            }
        } else {
            console.log("No session found for settings :", zipcode, " below age: ", config.below_age)
        }
    }
    return email_sent_in_this_session_search
}

function get_request_options(zipcode) {
    /**
     * This function creates options for request 
     * returns : object conatining setting for request
     */
    let date = moment().format('DD-MM-YYYY');
    let request_options = {
        url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${zipcode}&date=${date}`,
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
    /**
     * This main driver function
     * looping on all zip codes and making URL and then sending email notification
     */
    for (zipcode of config.zipcode) {
        search_cowin_data_for_zipcode(zipcode)
    }
}, (config.check_for_session_after_seconds * 1000))

function set_email_reminder_true(zipcode) {
    /**
     * This function set email reminders true again after defined minutes so your email does not overflow with same notification
     */
    setTimeout(() => {
        zipcode_email_tracker_data[`${zipcode}`] = true
    }, (config.dnd_email_minutes * 60000))
}