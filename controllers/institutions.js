const errorHandler = require('../utils/errorHandler')
const Institution = require('../models/Institution')
const User = require('../models/User')


module.exports.create = async function(req, res) {
  try {

    const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})
    
    const candidate = await Institution.findOne({name: req.body.name})
    
    if (candidate) {
      //  Такое учреждение существует, нужно отправить ошибку
      res.status(409).json({
        message: 'Такое учреждение уже существует.'
      })
    } else {
      // Нужно создать учреждение
      const institution = await new Institution({
        img: req.file ? req.file.location : '/images/institution.png',
        name: req.body.name        
      }).save()
      res.status(201).json(institution)

    }
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

      if (req.file) updated.img = req.file.location

      const institution = await Institution.findOneAndUpdate(
        {_id: req.params.institutionID},
        {$set: updated},
        {new: true}
      )
      res.status(200).json(institution)
    } catch (e) {
      errorHandler(res, e)
    }
  }
  
module.exports.getAllAdmin = async function(req, res) {
    try {

      const now = new Date();
      await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})

      if (req.user.levelStatus == 1) {
        const institutions = await Institution.find().sort({name: 1}).lean()
        res.status(200).json(institutions)
      } else {
        const institution = await Institution.find({_id: req.user.institution}).lean()
        res.status(200).json(institution)
      }
      
    } catch (e) {
      errorHandler(res, e)
    }
  }

  module.exports.getAll = async function(req, res) {
    try {
      const institution = await Institution.find().sort({name: 1}).lean()
      res.status(200).json(institution)
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.getByInstitutionID = async function(req, res) {
    try {
      const institution = await Institution.findOne({_id: req.params.institutionID})
      res.status(200).json(institution)
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.remove = async function(req, res) {
    try {
      if(req.params.institutionID != req.params.newID) {
        await User
        .updateMany({institution: req.params.institutionID}, 
          {$set: {institution: req.params.newID}
        })
        await Institution.deleteOne({_id: req.params.institutionID})
        res.status(200).json({
          message: 'Учреждение удалено.'
        })
      }
      else {
        res.status(409).json({
          message: 'Вы не можете перевести пользователей в удаляемое учреждение.'
        })
      }
    } catch (e) {
      errorHandler(res, e)
    }
  }