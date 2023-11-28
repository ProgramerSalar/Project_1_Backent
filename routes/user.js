const {User} = require("../models/user.js")
const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const jwt = require('jsonwebtoken')


router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash')

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})



router.post('/register', async(req, res) => {
    
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password, 15),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        street:req.body.street,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,
        
        
    })
    
    user = await user.save()
    if(!user)
    return res.status(404).send('user cannot be created')
    res.send(user) 
})

router.get(`/:id`, async (req, res) =>{
    const userList = await User.findById(req.params.id).select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false, message:"User is not found"})
    } 
    res.send(userList);
})


router.post('/login', async(req, res) => {


    const user = await User.findOne({email: req.body.email})
   

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin,
            },
            process.env.SECRET_KEY,
            {
                expiresIn:'1d'
            }
        )
        res.status(200).send({user:user.email, token:token})
    }

    else{
        res.send('password not match')
    }

})


router.get('/get/count', async(req,res) => {
    const userCount = await User.countDocuments()

    if(!userCount){
        res.status(500).json({success:false})
    }
    res.send({userCount:userCount})
})




module.exports = router;