# How to use
1. Install Node.js from this website : https://nodejs.org/en/download/
2. follow this guide till step 3 till you have app password for gmail account. Link https://support.cloudways.com/configure-gmail-smtp/
3. go to the directry where you installed/pasted this repo/folder and run command : `npm install`
4. cofigure config.json file 
enter details 
    ```
        {
        "email_user": email you generated app password for,
        "email_pass": app password you generated,
        "zipcode": [
            "postal code of area",
            "postal code of area 2"
        ],
        "send_email_to": 
        [
            "abc@gmail.com",  
            "abc2@gmail.com"
        ],
        "below_age": 30, // Below age like 30 60 90. 
        "dose": 1,  // which dose are you looking to get 1st(value 1) or 2nd (value 2)
        "dnd_email_minutes": 10, // after getting 1 email alert send another email alert after `n` number of minutes
        "check_for_session_after_seconds": 1 // check for available session after every `n` number of seconds
        "vaccine_list": [ // vaccine you are looking for
            "COVAXIN",
            "COVISHIELD"
        ]
    }
    ```
5. run command : `npm test` or can also run command : `node index.js`
6. Enjoy It will now send email to emails added in `send_email_to` in config.json 