import HeaderRegion from '../models/headerRegion.js';
import fs from 'fs';
import path from 'path';

// Create or Update Header Region
export const updateHeaderRegion = async (req, res) => {
  try {
    const { coreTitle, aboutUs, core, contact, heroTitle } = req.body;

    // Validate required fields
    if (!coreTitle || !aboutUs || !core || !contact || !heroTitle) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Get uploaded image paths
    const menuImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        menuImages.push({
          url: `/uploads/images/${file.filename}`,
          filename: file.filename
        });
      });
    }

    // Check if header region already exists
    let headerRegion = await HeaderRegion.findOne();

    if (headerRegion) {
      // Delete old images from disk
      if (headerRegion.menuImages && headerRegion.menuImages.length > 0) {
        headerRegion.menuImages.forEach(image => {
          const imagePath = path.join('uploads/images', image.filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }

      // Update existing record
      headerRegion.coreTitle = coreTitle;
      headerRegion.aboutUs = aboutUs;
      headerRegion.core = core;
      headerRegion.contact = contact;
      headerRegion.heroTitle = heroTitle;
      headerRegion.menuImages = menuImages;
      headerRegion.updatedAt = Date.now();

      await headerRegion.save();
    } else {
      // Create new record
      headerRegion = new HeaderRegion({
        coreTitle,
        aboutUs,
        core,
        contact,
        heroTitle,
        menuImages
      });

      await headerRegion.save();
    }

    res.status(200).json({
      success: true,
      message: 'Header region updated successfully',
      data: headerRegion
    });

  } catch (error) {
    console.error('Error updating header region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update header region',
      error: error.message
    });
  }
};

// Get Header Region Data
export const getHeaderRegion = async (req, res) => {
  try {
    const headerRegion = await HeaderRegion.findOne();

    if (!headerRegion) {
      return res.status(404).json({
        success: false,
        message: 'Header region not found'
      });
    }

    res.status(200).json({
      success: true,
      data: headerRegion
    });

  } catch (error) {
    console.error('Error fetching header region:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch header region',
      error: error.message
    });
  }
};
