const multer = require('multer');

const Item = require('../models/item');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Use without image processing
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/items');
  },
  filename: (req, file, cb) => {
    //item-filename-timestape.file_extension
    const extension = file.mimetype.split('/')[1];
    const fileName = file.originalname.split('.')[0];
    cb(null, `item-${fileName}-${Date.now()}.${extension}`);
  },
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadItemPhoto = upload.single('image');

// exports.resizeItemPhoto = (req, res, next) => {
//   if (!req.file) {
//     return next();
//   }

//   const filename = req.file.originalname.split('.')[0];
//   req.file.filename = `item-${filename}-${Date.now()}.jpeg`;

//   sharp(req.file.buffer)
//     .resize(1000, 1000)
//     .toFormat('jpeg')
//     .jpeg({ quality: 90 })
//     .toFile(`public/img/items/${req.file.filename}`);

//   req.file.path = `public/img/items/${req.file.filename}`;

//   next();
// };

exports.createItem = catchAsync(async (req, res, next) => {
  const { name, description, price, category } = req.body;
  const image = req.file.filename;

  const newItem = await Item.create({
    name,
    description,
    price,
    category,
    image,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newItem,
    },
  });
});

exports.getAllItem = catchAsync(async (req, res, next) => {
  //{ category: 'tent', id: '9749234' }
  const queryobj = { ...req.query };
  const excludeFields = ['page', 'sort', 'limit', 'fields'];
  excludeFields.forEach((ele) => delete queryobj[ele]);

  //{"category":"tent","id":"9749234"}
  let queryStr = JSON.stringify(queryobj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Item.find(JSON.parse(queryStr));

  if (req.query.sort) {
    query = query.sort(req.query.sort);
  }
  const items = await query;
  //items[0].name
  res.status(200).json({
    status: 'success',
    results: items.length,
    data: {
      items,
    },
  });
});

exports.getItem = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  // Doesn't handle invalid id: Mongoose will not be able to convert into MongoDB ID
  if (!item) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      item,
    },
  });
});

exports.deleteItem = catchAsync(async (req, res, next) => {
  const item = await Item.findByIdAndDelete(req.params.id);

  if (!item) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
