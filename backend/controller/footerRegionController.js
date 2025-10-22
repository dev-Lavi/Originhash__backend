import FooterRegion from '../models/footerRegion.js';
import fs from 'fs';
import path from 'path';

// Create or Update Footer Region
export const updateFooterRegion = async (req, res) => {
  try {
    const { cultureTitle, testimonialTitle, testimonialText } = req.body;

    // Validate required fields
    if (!cultureTitle || !testimonialTitle || !testimonialText) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if files were uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one culture image and one testimonial image'
      });
    }

    // Process culture images
    const cultureImages = [];
    const cultureImageFiles = req.files.filter(file => file.fieldname === 'cultureImages');
    
    if (cultureImageFiles.length > 0) {
      cultureImageFiles.forEach(file => {
        cultureImages.push({
          url: `/uploads/images/${file.filename}`,
          filename: file.filename
        });
      });
    }

    // Process testimonial image
    let testimonialImage = null;
    const testimonialImageFile = req.files.find(file => file.fieldname === 'testimonialImage');
    
    if (testimonialImageFile) {
      testimonialImage = {
        url: `/uploads/images/${testimonialImageFile.filename}`,
        filename: testimonialImageFile.filename
      };
    }

    // Check if footer region already exists
    let footerRegion = await FooterRegion.findOne();

    if (footerRegion) {
      // Delete old culture images from disk
      if (footerRegion.cultureImages && footerRegion.cultureImages.length > 0) {
        footerRegion.cultureImages.forEach(image => {
          const imagePath = path.join('uploads/images', image.filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }

      // Delete old testimonial image from disk
      if (footerRegion.testimonialImage && footerRegion.testimonialImage.filename) {
        const imagePath = path.join('uploads/images', footerRegion.testimonialImage.filename);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Update existing record
      footerRegion.cultureTitle = cultureTitle;
      footerRegion.cultureImages = cultureImages;
      footerRegion.testimonialTitle = testimonialTitle;
      footerRegion.testimonialText = testimonialText;
      footerRegion.testimonialImage = testimonialImage;
      footerRegion.updatedAt = Date.now();

      await footerRegion.save();
    } else {
      // Create new record
      footerRegion = new FooterRegion({
        cultureTitle,
        cultureImages,
        testimonialTitle,
        testimonialText,
        testimonialImage
      });

      await footerRegion.save();
    }

    res.status(200).json({
      success: true,
      message: 'Footer region updated successfully',
      data: footerRegion
    });

  } catch (error) {
    console.error('Error updating footer region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update footer region',
      error: error.message
    });
  }
};

// Get Footer Region Data
export const getFooterRegion = async (req, res) => {
  try {
    const footerRegion = await FooterRegion.findOne();

    if (!footerRegion) {
      return res.status(404).json({
        success: false,
        message: 'Footer region not found'
      });
    }

    res.status(200).json({
      success: true,
      data: footerRegion
    });

  } catch (error) {
    console.error('Error fetching footer region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer region',
      error: error.message
    });
  }
};
