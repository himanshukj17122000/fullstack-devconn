const sgmail = require("@sendgrid/mail");

sgmail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: `${process.env.SENDER_GRID}`,
        subject: "Thanks for joining in!",
        text: `Welcome to the app, ${name}! Let me know how you get along with the app. `,
    });
};

const cancelEmail = (email, name) => {
    sgmail.send({
        to: email,
        from: `${process.env.SENDER_GRID}`,
        subject: "Sorry about cancelling!",
        text: `We are said that you are leaving our app, ${name}! Let me know the problems. `,
    });
};
module.exports = {
    sendEmail,
    cancelEmail,
};