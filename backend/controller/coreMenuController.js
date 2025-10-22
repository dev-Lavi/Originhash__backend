import CoreMenu from '../models/coreMenu.js';
import fs from 'fs';
import path from 'path';

// Create or Update Core Menu
export const updateCoreMenu = async (req, res) => {
  try {
    const { coreTitle, sno, menuItems } = req.body;

    // Validate required fields
    if (!coreTitle || !sno) {
      return res.status(400).json({
        success: false,
        message: 'Core Title and SNO are required'
      });
    }

    // Parse menu items if sent as string
    let parsedMenuItems;
    try {
      parsedMenuItems = typeof menuItems === 'string' ? JSON.parse(menuItems) : menuItems;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu items format'
      });
    }

    if (!parsedMenuItems || parsedMenuItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one menu item is required'
      });
    }

    // Process uploaded images
    const uploadedFiles = req.files || [];
    const menuItemsWithImages = parsedMenuItems.map((item, index) => {
      const itemFile = uploadedFiles.find(file => 
        file.fieldname === `menuItems[${index}][picture]`
      );

      return {
        name: item.name,
        details: item.details,
        price: item.price,
        picture: itemFile ? {
          url: `/uploads/images/${itemFile.filename}`,
          filename: itemFile.filename
        } : null
      };
    });

    // Validate all menu items have required fields
    const invalidItems = menuItemsWithImages.filter(
      item => !item.name || !item.details || !item.price || !item.picture
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All menu items must have name, details, price, and picture'
      });
    }

    // Check if menu with this SNO already exists
    let coreMenu = await CoreMenu.findOne({ sno });

    if (coreMenu) {
      // Delete old images from disk
      if (coreMenu.menuItems && coreMenu.menuItems.length > 0) {
        coreMenu.menuItems.forEach(item => {
          if (item.picture && item.picture.filename) {
            const imagePath = path.join('uploads/images', item.picture.filename);
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }
        });
      }

      // Update existing record
      coreMenu.coreTitle = coreTitle;
      coreMenu.menuItems = menuItemsWithImages;
      coreMenu.updatedAt = Date.now();

      await coreMenu.save();
    } else {
      // Create new record
      coreMenu = new CoreMenu({
        coreTitle,
        sno,
        menuItems: menuItemsWithImages
      });

      await coreMenu.save();
    }

    res.status(200).json({
      success: true,
      message: 'Core menu updated successfully',
      data: coreMenu
    });

  } catch (error) {
    console.error('Error updating core menu:', error);
    
    // Handle duplicate SNO error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A menu with this SNO already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update core menu',
      error: error.message
    });
  }
};

// Get all Core Menus
export const getAllCoreMenus = async (req, res) => {
  try {
    const coreMenus = await CoreMenu.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coreMenus.length,
      data: coreMenus
    });

  } catch (error) {
    console.error('Error fetching core menus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch core menus',
      error: error.message
    });
  }
};

// Get Core Menu by SNO
export const getCoreMenuBySno = async (req, res) => {
  try {
    const { sno } = req.params;

    const coreMenu = await CoreMenu.findOne({ sno });

    if (!coreMenu) {
      return res.status(404).json({
        success: false,
        message: 'Core menu not found'
      });
    }

    res.status(200).json({
      success: true,
      data: coreMenu
    });

  } catch (error) {
    console.error('Error fetching core menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch core menu',
      error: error.message
    });
  }
};

// Delete Core Menu by SNO
export const deleteCoreMenu = async (req, res) => {
  try {
    const { sno } = req.params;

    const coreMenu = await CoreMenu.findOne({ sno });

    if (!coreMenu) {
      return res.status(404).json({
        success: false,
        message: 'Core menu not found'
      });
    }

    // Delete images from disk
    if (coreMenu.menuItems && coreMenu.menuItems.length > 0) {
      coreMenu.menuItems.forEach(item => {
        if (item.picture && item.picture.filename) {
          const imagePath = path.join('uploads/images', item.picture.filename);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      });
    }

    await CoreMenu.deleteOne({ sno });

    res.status(200).json({
      success: true,
      message: 'Core menu deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting core menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete core menu',
      error: error.message
    });
  }
};
