const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

function configureCloudinary(){
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return false;
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  return true;
}

async function uploadBuffer(buffer, options = {}){
  if (!configureCloudinary()) {
    throw new Error('Cloudinary is not configured');
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ 
      folder: options.folder || 'saas-task-uploads',
      resource_type: 'auto' 
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function deleteFile(publicId){
  if (!configureCloudinary()) {
    throw new Error('Cloudinary is not configured');
  }
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
}

module.exports = { uploadBuffer, deleteFile };
