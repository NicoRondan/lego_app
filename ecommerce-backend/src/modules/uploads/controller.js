const cloudinary = require('../../shared/cloudinary');
const { ApiError } = require('../../shared/errors');

exports.uploadImage = async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) throw new ApiError('image is required', 400);
    const result = await cloudinary.uploader.upload(image, { folder: 'lego_app' });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    next(err);
  }
};
