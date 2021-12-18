const errorHandler = require('../utils/errorHandler')
const User = require('../models/User')
const Picture = require('../models/Picture')
const Message = require('../models/Message')

module.exports.friends = async function(req, res) {
  try {
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

      function compareTime(a, b) {
        if (a.time < b.time) {
          return 1
        }
        if (a.time > b.time) {
          return -1
        }
        return 0
      }

      const NotRead = await Message.distinct("sender", {recipient: req.user.id, read: false})

      const withMessageUsers = await User.find(
        { _id: {$ne: req.user.id, $in: NotRead}}, {name: 1, 
          surname: 1, photo: 1, birthDate: 1, onlineStatus: 1, last_active_at: 1, sex: 1}
      ).lean()

      for (let user of withMessageUsers) {
        const message = await Message
          .findOne({sender: user._id, recipient: req.user.id, read: false}, {time: 1}).sort({time: -1})
        user.time = message.time
      }

      withMessageUsers.sort(compareTime)

      const readSenders = await Message.distinct("sender", {recipient: req.user.id, read: true})
      const readRecipients = await Message.distinct("recipient", {sender: req.user.id})

      function union_arr(arr1, arr2) {
        for (let i = 0; i < arr1.length; i++) arr1[i] = arr1[i].toString()
        for (let i = 0; i < arr2.length; i++) arr2[i] = arr2[i].toString()
        for (let el of arr2) {
          if (!arr1.includes(el)) arr1.push(el);
        }
        return arr1;
      }

      const read = union_arr(readSenders, readRecipients)

      const withoutMessageUsers = await User.find(
        {_id: {$in: read, $ne: req.user.id, $nin: NotRead}}, 
        {name: 1, surname: 1, photo: 1, birthDate: 1, onlineStatus: 1, last_active_at: 1, sex: 1}
      ).lean()

      for (let user of withoutMessageUsers) {
        const message = await Message
          .findOne({$or: [
            {sender: user._id, recipient: req.user.id}, 
            {sender: req.user.id, recipient: user._id}
          ]}, {time: 1}).sort({time: -1})
        user.time = message.time
      }

      withoutMessageUsers.sort(compareTime)

      const users = {withMessageUsers, withoutMessageUsers}

      res.status(200).json(users)
    } catch(e) {
      errorHandler(res, e)
    }
  }

module.exports.search = async function(req, res) {
    try {
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
        
      const users = await User
        .find({institution: req.params.instID, $or: [ { levelStatus: { $ne: 4} }, { onlineStatus: { $ne: '-1'} } ], _id: { $ne: req.user._id } }, 
          {name: 1, surname: 1, birthDate: 1, onlineStatus: 1, photo: 1, last_active_at: 1, sex: 1})
        .sort({name: 1, surname: 1}).lean()
      
      for (let user of users) {
        const message = await Message
          .findOne({sender: user._id, recipient: req.user.id, read: false}, {_id: 1}).lean()
        if (message) user.letter = true
        else user.letter = false
      }

      res.status(200).json(users)
    } catch (e) {
      errorHandler(res, e)
    }
}

module.exports.search2 = async function(req, res) {
  try {
    const now = new Date();

    q = {$or: [ { levelStatus: { $ne: 4} }, { onlineStatus: { $ne: '-1'} } ], _id: { $ne: req.user._id }}

    if (req.query.institution) {
      q.institution =  req.query.institution
    }

    if (req.query.birthday === 'true') q = {...q,
      $expr: { 
        $and: [
             { "$eq": [ { "$dayOfMonth": "$birthDate" }, { "$dayOfMonth": now } ] },
             { "$eq": [ { "$month"     : "$birthDate" }, { "$month"     : now } ] }
        ]
     }
    }
      
    const users = await User
      .find(q, {name: 1, surname: 1, birthDate: 1, onlineStatus: 1, photo: 1, last_active_at: 1, sex: 1})
      .sort({last_active_at: -1,score: -1, _id: 1})
      .skip(+req.query.offset)
      .limit(+req.query.limit)
      .lean()
    
    for (let user of users) {
      const message = await Message
        .findOne({sender: user._id, recipient: req.user.id, read: false}, {_id: 1}).lean()
      if (message) user.letter = true
      else user.letter = false
    }

    res.status(200).json(users)
  } catch (e) {
    errorHandler(res, e)
  }
}

  module.exports.toPictures = async function(req, res) {
    try {       
      const users = await User
        .find({institution: req.params.instID}, 
          {name: 1, surname: 1, login: 1})
        .sort({name: 1, surname: 1})

      res.status(200).json(users)
    } catch (e) {
      errorHandler(res, e)
    }
  }

  module.exports.exitDelete = async function(req, res) {
    try {
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {onlineStatus: '-1'}},
        {new: true}) 

      if (req.user.levelStatus == 4) {
        await Message.deleteMany({ $or: [
          {sender: req.user.id},
          {recipient: req.user.id}
          ]
        })
        await Picture.deleteMany({ 
          user: req.user.id, parent: {$in: 
            ['5f1309e3962c2f062467f854', '5f1309f1962c2f062467f855', '5f130a00962c2f062467f856', 
            '5f130a0d962c2f062467f857', '5f5486f982194ca1fb21ff6d', '603e1ae80c54fc9b6e417951',
            '603e1b0c0c54fc9b6e417952','603e1b430c54fc9b6e417953', '603e1b630c54fc9b6e417954',
            '603e1ba10c54fc9b6e417955'
          ]}
        })
      }
      res.status(200).json({message: 'Данные гостя удалены, статус пользователя обновлён.'})
    } catch(e) {
      errorHandler(res, e)
    }
  }

  module.exports.exitLogout = async function(req, res) {
    try {
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {onlineStatus: '-1'}},
        {new: true}) 

      res.status(200).json({message: 'Cтатус пользователя обновлён.'})
    } catch(e) {
      errorHandler(res, e)
    }
  }

  module.exports.getUser = async function(req, res) {
    try {
      const user = await User.findOne({login: req.user.login}, {password: 0})
      res.status(200).json(user)
    } catch(e) {
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
      delete updated.score

      const user = await User.findOneAndUpdate(
        {_id: req.user.id},
        {$set: updated},
        {new: true})
      res.status(200).json(user)
    } catch {
      errorHandler(res, e)
    }
  }

module.exports.score = async function(req, res) {
  const now = new Date();
  await User.updateOne(
    {_id: req.user.id}, 
    {$set: {last_active_at: now}, $inc: {score: req.body.score}},
    {new: true})

  res.status(200).json({message: 'Обновлено.'})
}
