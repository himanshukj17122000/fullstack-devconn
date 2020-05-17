const sgmail = require("@sendgrid/mail");

sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: "himanshukj17122000@gmail.com",
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}! Let me know how you get along with the app. `,
    });
};

const cancelEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: "himanshukj17122000@gmail.com",
        subject: "Sorry about cancelling!",
        text: `We are said that you are leaving our app, ${name}! Let me know the problems. `,
    });
};
module.exports = {
    sendEmail,
    cancelEmail,
};