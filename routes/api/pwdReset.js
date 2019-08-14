const express = require('express');
const router = express.Router();
const Users = require('../../models/user.model');
const pwdReset = require('../../models/passwordReset.model');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
const config = require('../../data.config');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.SENDGRID_APIKEY);

const saltRounds = 10;

router.post('/send-code', async (req, res) => {
    try {
        email = req.body.email;

        let emailExist = Users.find({ email }).countDocuments();

        if (emailExist > 0) {
            let user = await Users.findOne({ email });
            
            let codeId = new ObjectId();
            let msg = {
                to: email,
                from: 'noreply@shortcut.com',
                subject: 'Password Reset',
                html: `
                Please click <a href='http://www.shortcut.com/reset-password/${ codeId }>here</a>.
                <br><br>
                <strong>NOTE:</strong> This link is only for one time use.
                `
             }

             let newPWD = new pwdReset({
                 user: user._id,
                 flag: codeId,
                 used: false
             });

             let result = await newPWD.save();

             if (result) {
                sgMail.send(msg);                 
             }

             return res.send({success: 'Sent successfully, please check your email for further instructions.'});
        }
        
    } catch (error) {
        res.send(error);
    }
});

router.get('/verify-code/:id', async (req, res) => {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
        return res.status(400).send(`Not valid code.`);
    
    let valid = await pwdReset.find({ flag: id, used: false }).countDocuments();
    
    if (valid > 0) {
        return res.send({ valid: true });
    }
    else {
        return res.send({ valid: false });
    }
});

router.patch('/submitCode/:id', async (req, res) => {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
        return res.status(400).send(`Not valid code.`);
    
    let valid = await pwdReset.find({ flag: id, used: false }).countDocuments();
    
    if (valid > 0) {
        let pwdUser = await pwdReset.findOne({ flag: id });
        let user = await Users.findOne({ _id: pwdUser.user });

        user.password = bcrypt.hashSync(req.body.password, saltRounds);

        await Users.findByIdAndUpdate(user._id, {
            $set: user
         }, {
            new: true
         }, (err, doc) => {
            if (!err) {
               doc.save();
               res.send(doc);
            } else {
               console.log('Error in password update :' + JSON.stringify(err, undefined, 2));
            }
         });
    }
    else {
        return res.send({ valid: false });
    }
});

module.exports = router;
