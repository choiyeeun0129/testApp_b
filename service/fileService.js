const path = require("path");
const fs = require("fs");
const multer = require('multer');
const Jimp = require("jimp").default;
const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const config = require('../env/config');
const util = require('../utils/default');
const dates = require('../utils/dates');

let _uploadDir = config.UPLOAD_DIR;

const fileService = {
    upload: function(){
        return multer({
            // 파일 저장 위치 (disk , memory 선택)
            storage: multer.diskStorage({
                destination: function (req, file, done) {
                    done(null, _uploadDir);
                },
                filename: function (req, file, done) {
                    const ext = path.extname(file.originalname);
                    const name = path.basename(file.originalname, ext) + Date.now() + ext;
                    done(null, name);
                }
            }),
            limits: { 
                fileNameSize: config.UPLOAD_FILE_NAME_SIZE,
                fileSize: Number(config.UPLOAD_FILE_SIZE) * 1024 * 1024,
                files: config.UPLOAD_FILE_COUNT
            },
            fileFilter: function(req, file, done) {
                // 이미지 파일만 허용
                if (file.mimetype.lastIndexOf('image') > -1) {
                    done(null, true);
                } else {
                    done(null, false);
                    throw new Error('Check file type! Only image format allowed.')
                }
            }
        });
    },
    checkDir: async function(){
        try {
            fs.readdirSync(_uploadDir);
        } catch (e) {
            console.error('not exist directory.', e);
            fs.mkdirSync(_uploadDir);
        }
    },
    get: async function(id){
        return await prisma.files.findUnique({
            where: { id: Number(id) }
        });
    },
    save: async function({ filename, originalname, mimetype, destination, path, size, encoding }){
        if(! filename || filename == 'undefined') throw new Error('upload data is empty.')
        let imageWidth = 0;
        let imageHeight = 0;
        if(mimetype.includes('image')){
            // resizing
            // let image = await Jimp.read(path);
            // if(image.bitmap.width >= config.UPLOAD_IMAGE_MAX_WIDTH) image.resize(Number(config.UPLOAD_IMAGE_MAX_WIDTH), Jimp.AUTO).write(path);
            // imageWidth = image.bitmap.width;
            // imageHeight = image.bitmap.height;
            // let _file = fs.statSync(path);
            // if(_file) size = _file.size;
        }

        return await prisma.files.create({ 
            data: {
                fileName: filename,
                originalName: originalname,
                mimeType: mimetype,
                destination,
                path,
                size,
                imageWidth,
                imageHeight
            }
        });
    },
    delete: async function(id){
        let file = await this.get(id);
        if(! file) return null;
        try {
            fs.unlinkSync(file.path);
        } catch(e){
            console.error('file delete - unlinkSync error', e);
        }
        return await prisma.files.delete({
            where: { id: Number(id) }
        });
    },
}

module.exports = fileService;