const mongoose = require('mongoose')
const errorHandler = require('../utils/errorHandler')
const User = require('../models/User');
const Event = require('../models/Event');
const Bot = require('../models/Bot');
const Institution = require('../models/Institution');
const GroupMessage = require('../models/GroupMessage');
// const { Expo } = require('expo-server-sdk')

module.exports.create = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
          {_id: req.user.id}, 
          {$set: {last_active_at: now}, $inc: {score: 10}},
          {new: true})

        const bot = await Bot.findOne({type: req.body.type}).lean()
        
        const event = await new Event({
            autor: req.user.id,
            wait: [],
            institutions: req.body.wait,
            type: req.body.type,
            description: req.body.description,
            status: 0,
            chatImage: bot.img,
            institution: req.user.institution
        }).save()

        res.status(201).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getForModerators = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true})

        q = {}
        if (req.user.levelStatus != 1) q.institution = req.user.institution
        else if (req.query.institution) q.institution = req.query.institution 
        
        let events = await Event
            .find(q)
            .sort({createTime: -1})
            .skip(+req.query.offset)
            .limit(+req.query.limit)
            .lean()

        for (let event of events) {
            const text = await Bot.findOne({type: event.type})
            event.text = text.text
            const autorName = await User.findOne({_id: event.autor}, {name: 1, surname: 1, login: 1})
            event.autorName = autorName.name + ' ' + autorName.surname + ', ' + autorName.login
        }
        res.status(200).json(events)
    } catch (e) {
        errorHandler(res, e) 
    }
}

module.exports.update = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true})
        
        const updated = req.body

        if (req.body.status == '1') {
            updated.mailingTime = now
        }
        console.log(req.body.p_status)
        if (req.body.p_status == 'true') {
            console.log('here')
            updated.p_status = true
            updated.wait = []
            updated.institutions = []
            updated.institutions = []
            updated.wait = []
        }
        else if (req.body.institutions && req.body.institutions != "") {
            const array = req.body.institutions.split(',')
            const set = new Set(array)
            const uniqeArray = [...set]
            updated.institutions = uniqeArray
            updated.wait = []
            updated.p_status = false
            updated.wait = []
        }
        else if (req.body.wait && req.body.wait != "") {
            const array = req.body.wait.split(',')
            const set = new Set(array)
            const uniqeArray = [...set]
            updated.wait = uniqeArray
            updated.p_status = false
            updated.institutions = []
        }
        if (req.body.status == 2) updated.closingTime = now
        if (req.files['image']) updated.chatImage = req.files['image'][0].location
        if (req.files['photolikes']) {
            let paths = req.files['photolikes'].map(file => file.location)
            await Event.findOneAndUpdate(
                {_id: req.params.eventID},
                {$addToSet: {photolikes: { $each: paths}}},
                {new: true}
            )
        }

        delete updated.photolikes
        
        const event = await Event.findOneAndUpdate(
            {_id: req.params.eventID},
            {$set: updated},
            {new: true}
        )

        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getByID = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true}
        )

        const event = await Event.findOne({_id: req.params.eventID}).lean()

        const participantsNames = []
        const hideNames = []

        for (let participant of event.participants) {
            const user = await User.findOne({_id: participant._id}, {name: 1, surname: 1, login: 1, institution: 1}).lean()
            const institution = await Institution.findOne({_id: user.institution}, {name: 1}).lean()
            participantsNames.push(`${user.name} ${user.surname}, ${user.login}, ${institution.name}`)
        }
        for (let hide of event.hide) {
            const user = await User.findOne({_id: hide._id}, {name: 1, surname: 1, login: 1, institution: 1}).lean()
            const institution = await Institution.findOne({_id: user.institution}, {name: 1}).lean()
            hideNames.push(`${user.name} ${user.surname}, ${user.login}, ${institution.name}`)
        }

        event.participantsNames = participantsNames
        event.hideNames = hideNames

        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getForBot = async function (req, res) {
    try {
        function compareFunction(a, b) {
            if (a.Tpoint < b.Tpoint) return -1;
            return 1;
        }

        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}, $inc: {score: 1}},
            {new: true})
        
        const events = await Event
        .find({
            hide: {$ne: req.user.id},
            $or: [
            {autor: req.user.id}, 
            {participants: req.user.id, status: 1},
            {wait: req.user.id, status: 1},
            {institutions: req.user.institution, status: 1},
            {p_status: true, status: 1}
        ]}).lean()

        for (let event of events) {
            if (event.status > 0) event.Tpoint = event.mailingTime
            else event.Tpoint = event.createTime
            const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, _id: 0}).lean()
            event.autorName = user.name
            event.autorSurname = user.surname
        }

        events.sort(compareFunction)

        res.status(200).json(events)

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getForEvents = async function (req, res) {
    try {
        //const id = mongoose.Types.ObjectId(req.user.id); 
        
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true}) 
          
          if (req.params.online == '0') {
            await User.updateOne(
              {_id: req.user.id}, 
              {$set: {onlineStatus: '0'}},
              {new: true}
            ) 
          }


        function compareFunction(a, b) {
            if (a.Tpoint < b.Tpoint) return 1;
            return -1;
        }

        const events = await Event.find({participants: req.user.id, status: 1}).lean()

        for (let event of events) {
            const message = await GroupMessage.findOne({group: event._id}, {time: 1}).sort({time: -1}).lean()
            const notReadMessage = await GroupMessage.findOne({group: event._id, wait: req.user.id}, {_id: 1}).lean()
            if (notReadMessage) event.letter = true
            else event.letter = false
            if (message) event.Tpoint = message.time 
            else event.Tpoint = event.mailingTime       
        }

        events.sort(compareFunction)

        res.status(200).json(events)

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.changeUserStatus = async function (req, res) {
    try {
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}, $inc: {score: 3}},
            {new: true})

        const id = mongoose.Types.ObjectId(req.user.id);

        await Event.findOneAndUpdate(
            {_id: req.params.eventID},
            {$pull: {wait: id}},
            {new: true}
        )

        let new_event

        if (req.body.change == 1 ) {
            new_event = await Event.findOneAndUpdate(
                {_id: req.params.eventID},
                {$addToSet: {participants: id}},
                {new: true}
            )
        }
        else {
            new_event = await Event.findOneAndUpdate(
                {_id: req.params.eventID},
                {$addToSet: {hide: id}},
                {new: true}
            )
        }

        res.status(200).json(new_event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.emoLetters = async function(req, res) {
    try {
        const now = new Date();
        await User.updateOne(
          {_id: req.user.id}, 
          {$set: {last_active_at: now}},
          {new: true})

        const event = await Event.findOne({$or: [
            {wait: req.user.id, status: 1}, 
            {institutions: req.user.institution, status: 1, hide: {$ne: req.user.id}, participants: {$ne: req.user.id}}, 
            {p_status: true, status: 1, hide: {$ne: req.user.id}, participants: {$ne: req.user.id}}
        ]})

        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.deletePhoto = async function(req, res) {  
    try {
        const now = new Date()
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true}
        )

        const event = await Event.findOneAndUpdate(
            {_id: req.rarams.eventID},
            {$pullAll: { photolikes: req.body.deletePhoto }},
            {new: true}
        )
            
        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.pushLike = async function(req, res) {  
    try {
        const now = new Date()
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}, $inc: {score: 1}},
            {new: true}
        )

        const event = await Event.findOneAndUpdate(
            {_id: req.params.eventID},
            {$addToSet: {likes: req.user.id}},
            {new: true}
        )
            
        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.deleteLike = async function(req, res) {  
    try {
        const now = new Date()
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}, $inc: {score: -1}},
            {new: true})

        const event = await Event.findOneAndUpdate(
            {_id: req.params.eventID},
            {$pull: {likes: req.user.id}},
            {new: true}
        )
            
        res.status(200).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getForPhotolikes = async function (req, res) {
    try {
        const events = await Event.find(
            {status: 2}
            )
            .sort({closingTime: -1})
            .lean()
        
        for (let event of events) {
            const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, sex: 1, _id: 0}).lean()
            event.autorName = user.name
            event.autorSex = user.sex
            event.autorSurname = user.surname
        }

        res.status(200).json(events)

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getPublic = async function (req, res) {
    try {
        const events = await Event.find(
            {status: 1, p_status: true}
            )
            .sort({mailingTime: -1})
            .lean()

        for (let event of events) {
            const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, _id: 0}).lean()
            event.autorName = user.name
            event.autorSurname = user.surname
        }

        res.status(200).json(events)

    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getLikes = async function (req, res) {
    try {
        
        const event = await Event.findOne({_id: req.params.eventID}, {likes: 1})
        
        let users = []
        
        for (let id of event.likes) {
            const user = await User.findOne({_id: id}, {name: 1, surname: 1, photo: 1})
            if (user) users.push(user)
        }
        
        res.status(200).json(users)
        
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.remove = async function (req, res) {
    try {
        const event = await Event.findOne({_id: req.params.id}, {autor: 1, status: 1, institution: 1}) 
        if ((event.status == 0 || event.status == -1) && 
        (event.autor == req.user.id || req.user.levelStatus == 1 || 
        (req.user.levelStatus == 2 && event.institution === req.user.institution))) {
            await Event.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: 'Мероприятие удалено.'
              })
        }
        else {
            res.status(403).json({
              message: 'Недостаточно прав для совершения действия.'
            })
          }
    } catch (e) {
        errorHandler(res, e)
    }
}

