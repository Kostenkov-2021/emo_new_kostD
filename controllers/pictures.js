const errorHandler = require('../utils/errorHandler')
const Picture = require('../models/Picture');
const User = require('../models/User');
const mongoose = require('mongoose')

module.exports.create = async function(req, res) {
    try {
      const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})

      if (req.user.levelStatus == 1) {
        const lastPicture = await Picture
        .findOne({parent: req.params.parentID})
        .sort({p_sort: -1})

        const maxSort = lastPicture ? lastPicture.p_sort : 0

        const picture = await new Picture({
          folder: req.body.folder,
          answers: req.body.answers != '' ? req.body.answers.split(',') : [],
          exceptions: req.body.exceptions != '' ? req.body.exceptions.split(',') : [],
          text: req.body.text,
          textForGirls: req.body.textForGirls,
          parent: req.params.parentID,
          p_sort: maxSort + 1,
          boysGreyPicture: req.files ? (req.files['boysGreyPicture'] ? 'https://emo.su/uploads/' +  req.files['boysGreyPicture'][0].filename : '') : '', 
          girlsGreyPicture: req.files ? (req.files['girlsGreyPicture'] ? 'https://emo.su/uploads/' + req.files['girlsGreyPicture'][0].filename : '') : '',
          boysColorPicture: req.files ? (req.files['boysColorPicture'] ? 'https://emo.su/uploads/' + req.files['boysColorPicture'][0].filename : '') : '',
          girlsColorPicture: req.files ? (req.files['girlsColorPicture'] ? 'https://emo.su/uploads/' + req.files['girlsColorPicture'][0].filename : '') : '',
          invisible: req.body.invisible,
          system: req.body.system,
          user: req.user.id,
          many: req.body.many
        }).save()
        res.status(201).json(picture)
      } else {
        res.status(403).json({message: "У вас недостаточно прав для выполнения операции."})
      }
      } catch (e) {
        errorHandler(res, e)
      }
}

module.exports.update = async function(req, res) {
  try {
    const updated = req.body
    updated.answers = req.body.answers != '' ? req.body.answers.split(',') : []
    updated.exceptions = req.body.exceptions != '' ? req.body.exceptions.split(',') : []
    const archive = []
    const pictureOld = await Picture.findOne({_id: req.params.pictureID})
    if (req.files) {
      if (req.files['boysGreyPicture']) {
        updated.boysGreyPicture = 'https://emo.su/uploads/' + req.files['boysGreyPicture'][0].filename
        if (pictureOld.boysGreyPicture) archive.push(pictureOld.boysGreyPicture)
      }
      if (req.files['girlsGreyPicture']) {
        updated.girlsGreyPicture = 'https://emo.su/uploads/' + req.files['girlsGreyPicture'][0].filename
        if (pictureOld.girlsGreyPicture) archive.push(pictureOld.girlsGreyPicture)
      }
      if (req.files['boysColorPicture']) {
        updated.boysColorPicture = 'https://emo.su/uploads/' + req.files['boysColorPicture'][0].filename
        if (pictureOld.boysColorPicture) archive.push(pictureOld.boysColorPicture)
      }
      if (req.files['girlsColorPicture']) {
        updated.girlsColorPicture = 'https://emo.su/uploads/' + req.files['girlsColorPicture'][0].filename
        if (pictureOld.girlsColorPicture) archive.push(pictureOld.girlsColorPicture)
      }
    }
    
    const picture = await Picture.findOneAndUpdate(
      {_id: req.params.pictureID},
      {$addToSet: {archive: {$each: archive}}, $set: updated},
      {new: true}
    )
    res.status(200).json(picture)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getAll = async function(req, res) {
  try {
    const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true})

    const pictures = await Picture.find({parent: req.params.folderID}).sort({p_sort: 1}).lean()
    const folder = await Picture.findOne({_id: req.params.folderID}, {many: 1, parent:1, text: 1})
    const picturesAndFolder = {"pictures": pictures, "folder": folder}
    res.status(200).json(picturesAndFolder)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.getByPictureID = async function(req, res) {
  try {
    const picture = await Picture.findOne({_id: req.params.pictureID})
    res.status(200).json(picture)
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.remove = async function(req, res) {
  try {
    const now = new Date();
      await User.updateOne(
        {_id: req.user.id}, 
        {$set: {last_active_at: now}},
        {new: true}) 
        
    const deletePicture = await Picture.findOne({_id: req.params.pictureID})
  
    const pictures = await Picture.find({
      parent: deletePicture.parent,
      p_sort: {$gt: deletePicture.p_sort}
    })
    
    if (deletePicture.system === true) {
      res.status(200).json({
        message: 'Этот объект нельзя удалить.'
      })  
    }
    else {
      for (let picture of pictures) {
        await Picture.updateOne({_id: picture._id}, {$set: {p_sort: picture.p_sort - 1}}, {new: true})
      }
      if (deletePicture.folder === true) {
        message = 'Папка удалена.'
      } 
      else {
        message = 'Картинка удалена.'
      }
        await Picture.deleteOne(deletePicture)
        res.status(200).json({message})
  }
  } catch (e) {
    errorHandler(res, e)
  }
}

module.exports.game1 = async function (req, res) {
  try {
    const now = new Date();
    await User.updateOne(
      {_id: req.user.id}, 
      {$set: {last_active_at: now}},
      {new: true})
    
    const game = await Picture.aggregate([
      {$match: {text: {$ne: '', $exists: true}, parent: {$nin: 
        [
          mongoose.Types.ObjectId('5f1309e3962c2f062467f854'), 
          mongoose.Types.ObjectId('5f1309f1962c2f062467f855'), 
          mongoose.Types.ObjectId('5f130a00962c2f062467f856'), 
          mongoose.Types.ObjectId('5f130a0d962c2f062467f857'), 
          mongoose.Types.ObjectId('5f5486f982194ca1fb21ff6d'), 
          mongoose.Types.ObjectId('603e1ae80c54fc9b6e417951'),
          mongoose.Types.ObjectId('603e1b0c0c54fc9b6e417952'),
          mongoose.Types.ObjectId('603e1b430c54fc9b6e417953'), 
          mongoose.Types.ObjectId('603e1b630c54fc9b6e417954'),
          mongoose.Types.ObjectId('603e1ba10c54fc9b6e417955')
        ]}, folder: false}
      }, 
      {$sample: {size: +req.params.count}} 
    ])

    res.status(200).json(game)

  } catch (e) {
    errorHandler(res, e)
  }
}