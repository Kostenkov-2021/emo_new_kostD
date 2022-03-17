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
      //  Такое существует, нужно отправить ошибку
      res.status(409).json({
        message: 'Такая организация уже существует.'
      })
    } else {
      // Нужно создать 
      const institution = await new Institution({
        img: req.file ? req.file.path : '/images/institution.png',
        name: req.body.name,
        region: req.body.region
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

      if (req.file) updated.img = req.file.path

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
        q = {}
        if (req.query.region) q.region = req.query.region
        const institutions = await Institution.find(q).sort({name: 1}).lean()
        for (const institution of institutions) {
          const lastMonth = now - (1000 * 60 * 60 * 24 * 30)
          // institution.count = await User.count({institution: institution._id})
          institution.count_verificated = await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}})
          institution.count_active = await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}, last_active_at: {$gte: lastMonth}})
          institution.count_no_active = await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}, last_active_at: {$exists: false}})
        }
        res.status(200).json(institutions)
      } else {
        const institution = await Institution.find({_id: req.user.institution}).lean()
        // institution.count = await User.count({institution: institution._id})
        institution.count_verificated = await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}})
        institution.count_active = institution.count_verificated ? await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}, last_active_at: {$gte: lastMonth}}) : 0
        institution.count_no_active = institution.count_verificated ? await User.count({institution: institution._id, levelStatus: {$nin: [4, 6]}, last_active_at: {$exists: false}}) : 0
        res.status(200).json(institution)
      }
      
    } catch (e) {
      errorHandler(res, e)
    }
  }

  module.exports.getAll = async function(req, res) {
    try {
      q = {}
      if (req.query.region) q.region = req.query.region
      const institution = await Institution.find(q).sort({name: 1}).lean()
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
          message: 'Организация удалена.'
        })
      }
      else {
        res.status(409).json({
          message: 'Вы не можете перевести пользователей в удаляемую организацию.'
        })
      }
    } catch (e) {
      errorHandler(res, e)
    }
  }