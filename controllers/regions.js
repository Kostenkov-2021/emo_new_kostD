const errorHandler = require('../utils/errorHandler')
const Institution = require('../models/Institution')
const Region = require('../models/Region')
const User = require('../models/User')


module.exports.create = async function(req, res) {
  try {
    const candidate = await Region.findOne({name: req.body.name.trim()})
    
    if (candidate) {
      res.status(200).json(candidate)
    } else {
      // Нужно создать 
      const region = await new Region({
        name: req.body.name.trim()        
      }).save()
      res.status(201).json(region)
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

      const region = await Region.findOneAndUpdate(
        {_id: req.params.id},
        {$set: updated},
        {new: true}
      ).lean()
      const num = await Institution.count({region: region._id})
      region.count = num

      res.status(200).json(region)
    } catch (e) {
      errorHandler(res, e)
    }
  }

  module.exports.getAll = async function(req, res) {
    try {
      const regions = await Region.find().sort({name: 1}).lean()
      if (req.query.count) {
        for (const region of regions) {
          const num = await Institution.count({region: region._id})
          region.count = num
        }
      }
      res.status(200).json(regions)
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.getById = async function(req, res) {
    try {
      const region = await Region.findOne({_id: req.params.id})
      res.status(200).json(region)
    } catch (e) {
      errorHandler(res, e)
    }
  }

module.exports.remove = async function(req, res) {
    try {
        const iCount = await Institution.count({region: req.params.id})
        if (iCount) {
            res.status(409).json({
                message: 'Вы не можете удалить регион, потому что к нему прикреплены организации.'
            })
        } else {
            await Region.deleteOne({_id: req.params.id})
            res.status(200).json({
                message: 'Регион удален.'
            })
        }
    } catch (e) {
      errorHandler(res, e)
    }
  }