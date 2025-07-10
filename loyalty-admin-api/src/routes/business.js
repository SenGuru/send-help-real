const express = require('express');
const multer = require('multer');
const router = express.Router();
const businessController = require('../controllers/businessController');
const authMiddleware = require('../middleware/auth');
const { validateBusinessInfo } = require('../middleware/simpleValidation');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// Business information routes
router.get('/info', businessController.getBusinessInfo);
router.put('/info', validateBusinessInfo, businessController.updateBusinessInfo);

// Logo management routes
router.post('/logo', upload.single('logo'), businessController.uploadLogo);
router.delete('/logo', businessController.deleteLogo);

module.exports = router;