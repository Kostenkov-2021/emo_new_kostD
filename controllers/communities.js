const mongoose = require('mongoose')
const errorHandler = require('../utils/errorHandler')
const User = require('../models/User');
const Event = require('../models/Event');
const Community = require('../models/Community');
const Institution = require('../models/Institution');
// const { Expo } = require('expo-server-sdk')

module.exports.create = async function(req, res) {
    try {
        if (req.user.levelStatus == 6) res.status(403).json({message: 'Неподтверждённые профили не могут создавать сообщества'})
        const now = new Date();
        await User.updateOne(
          {_id: req.user.id}, 
          {$set: {last_active_at: now}},
          {new: true})
        
        const community = await new Community({
            autor: req.user.id,
            waitingList: req.body.waitingList,
            private_settings: req.body.private_settings,
            name: req.body.name,
            image: 'https://emo.su/images/people.png',
            description: req.body.description,
            status: req.body.status,
        }).save()

        res.status(201).json(event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.getForModerators = async function(req, res) {
    try {//event
        const now = new Date();
        await User.updateOne(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true})

        q = {}
        if (req.user.levelStatus != 1) q.institution = req.user.institution
        else if (req.query.institution) q.institution = req.query.institution
        if (req.query.status) q.status = req.query.status
        
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

        if (req.body.status == 1) {
            updated.mailingTime = now
        }

        if (req.body.p_status == 'true') {
            updated.p_status = true
            updated.sex = 0
            updated.wait = []
            updated.institutions = []
            updated.roles = []
        }
        else if (req.body.wait) {
            const array = req.body.wait.split(',')
            const set = new Set(array)
            const uniqeArray = [...set]
            updated.wait = uniqeArray
            updated.p_status = false
            updated.institutions = []
            updated.roles = []
            updated.sex = 0
        }
        else {
            const array = req.body.institutions ? req.body.institutions.split(',') : []
            const set = new Set(array)
            const uniqeArray = [...set]
            const arrayR = req.body.roles ? req.body.roles.split(',') : []
            const setR = new Set(arrayR)
            const uniqeArrayR = [...setR]
            updated.institutions = uniqeArray
            updated.roles = uniqeArrayR
            updated.p_status = false
            updated.wait = []
        }
        if (req.body.status == 2) updated.closingTime = now
        if (req.files['image']) updated.chatImage = 'https://emo.su/uploads/' + req.files['image'][0].filename
        if (req.files['photolikes']) {
            let paths = req.files['photolikes'].map(file => 'https://emo.su/uploads/' + file.filename)
            await Event.updateOne(
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
        ).lean()

        const participantsNames = []
        const hideNames = []

        for (let participant of event.participants) {
            const user = await User.findOne({_id: participant._id}, {name: 1, surname: 1, login: 1, institution: 1}).lean()
            const institution = await Institution.findOne({_id: user.institution}, {name: 1}).lean()
            participantsNames.push({...user, institutionName: institution.name ? institution.name : "Без организации"})
        }
        for (let hide of event.hide) {
            const user = await User.findOne({_id: hide._id}, {name: 1, surname: 1, login: 1, institution: 1}).lean()
            const institution = await Institution.findOne({_id: user.institution}, {name: 1}).lean()
            hideNames.push({...user, institutionName: institution.name ? institution.name : "Без организации"})
        }

        event.participantsNames = participantsNames
        event.hideNames = hideNames

        const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, sex: 1, _id: 0}).lean()
        event.autorName = user.name
        event.autorSurname = user.surname
        event.autorSex = user.sex

        if (req.body.status == 1) {
            await User.updateOne(
                {_id: event.autor}, 
                {$inc: {score: 10}},
                {new: true})
        }


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
            participantsNames.push({...user, institutionName: institution.name ? institution.name : "Без организации"})
        }
        for (let hide of event.hide) {
            const user = await User.findOne({_id: hide._id}, {name: 1, surname: 1, login: 1, institution: 1}).lean()
            const institution = await Institution.findOne({_id: user.institution}, {name: 1}).lean()
            hideNames.push({...user, institutionName: institution.name ? institution.name : "Без организации"})
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

        const now = new Date();
        const user = await User.findOneAndUpdate(
            {_id: req.user.id}, 
            {$set: {last_active_at: now}},
            {new: true})

        let events
        if (!req.query.mystatus) {
            events = await Event
            .find({
                hide: {$ne: req.user.id},
                $or: [
                    {autor: req.user.id}, 
                    {participants: req.user.id, status: 1},
                    {wait: req.user.id, status: 1},
                    {
                        institutions: req.user.institution, 
                        $or: [{sex: {$in: [0, user.sex]}}, {sex: {$exists: false}}],
                        $or: [{roles: req.user.levelStatus}, {roles: {$exists: false}}, {"roles.0": {$exists: false}}], 
                        status: 1
                    },
                    {p_status: true, status: 1}
                ]
            }, 
            {likes: 0, photolikes: 0})
            .sort({createTime: -1})
            .skip(+req.query.offset)
            .limit(+req.query.limit)
            .lean()
        }

        if (req.query.mystatus == 'hide') {
            events = await Event
            .find({
                hide: req.user.id,
                $or: [
                    {autor: req.user.id}, 
                    {status: 1},
                ]
            }, 
            {likes: 0, photolikes: 0})
            .sort({createTime: -1})
            .skip(+req.query.offset)
            .limit(+req.query.limit)
            .lean()
        }

        if (req.query.mystatus == 'participant') {
            events = await Event
            .find({
                participants: req.user.id,
                $or: [
                    {autor: req.user.id}, 
                    {status: 1},
                ]
            }, 
            {likes: 0, photolikes: 0})
            .sort({createTime: -1})
            .skip(+req.query.offset)
            .limit(+req.query.limit)
            .lean()
        }

        let q = {
            hide: {$ne: req.user.id},
            participants: {$ne: req.user.id},
        }
        if (req.user.levelStatus != 6) {
            q['$or'] = [
                {autor: req.user.id}, 
                {wait: req.user.id, status: 1},
                {
                    institutions: req.user.institution, 
                    $or: [{sex: {$in: [0, user.sex]}}, {sex: {$exists: false}}],
                    $or: [{roles: req.user.levelStatus}, {roles: {$exists: false}}, {"roles.0": {$exists: false}}], 
                    status: 1,
                },
                {p_status: true, status: 1}
            ]
        } else {
            q.status = 1
            q.p_status = true
        }
        if (req.query.mystatus == 'wait') {
            events = await Event
            .find(q, 
            {likes: 0, photolikes: 0})
            .sort({createTime: -1})
            .skip(+req.query.offset)
            .limit(+req.query.limit)
            .lean()
        }

        events.reverse()

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
            {$pull: {wait: id, hide: id, participants: id}},
            {new: true}
        )

        let new_event

        if (req.body.change == 1 ) {
            new_event = await Event.findOneAndUpdate(
                {_id: req.params.eventID},
                {$addToSet: {participants: id}},
                {new: true}
            ).lean()
        }
        else {
            new_event = await Event.findOneAndUpdate(
                {_id: req.params.eventID},
                {$addToSet: {hide: id}},
                {new: true}
            ).lean()
        }

        const user = await User.findOne({_id: new_event.autor}, {surname: 1, name: 1, sex: 1, _id: 0}).lean()
        new_event.autorName = user.name
        new_event.autorSurname = user.surname
        new_event.autorSex = user.sex

        res.status(200).json(new_event)
    } catch (e) {
        errorHandler(res, e)
    }
}

module.exports.emoLetters = async function(req, res) {
    try {
        const now = new Date();
        const user = await User.findOneAndUpdate(
          {_id: req.user.id}, 
          {$set: {last_active_at: now}},
          {new: true})

        const event = await Event.findOne({
            status: 1,
            $or: [
            {wait: req.user.id}, 
            {
                institutions: req.user.institution, 
                $or: [{sex: {$in: [0, user.sex]}}, {sex: {$exists: false}}],
                $or: [{roles: req.user.levelStatus}, {roles: {$exists: false}}, {"roles.0": {$exists: false}}], 
                hide: {$ne: req.user.id}, participants: {$ne: req.user.id}
            }, 
            {p_status: true, hide: {$ne: req.user.id}, participants: {$ne: req.user.id}}
        ]}, {_id: 1}).lean()

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
        ).lean()
        
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
        ).lean()

        const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, sex: 1, _id: 0}).lean()
        event.autorName = user.name
        event.autorSurname = user.surname
        event.autorSex = user.sex
        
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
        ).lean()

        const user = await User.findOne({_id: event.autor}, {surname: 1, name: 1, sex: 1, _id: 0}).lean()
        event.autorName = user.name
        event.autorSurname = user.surname
        event.autorSex = user.sex
            
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
            .skip(+req.query.offset)
            .limit(+req.query.limit)
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
            .skip(+req.query.offset)
            .limit(+req.query.limit)
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

