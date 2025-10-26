import Footer from '../models/footer.js';

// Create or Update Footer
export const updateFooter = async (req, res) => {
  try {
    const { contact, navigate, menu, socialMedia } = req.body;

    // Validate required fields
    if (!contact || !contact.phone || !contact.address || !contact.email) {
      return res.status(400).json({
        success: false,
        message: 'Contact details (phone, address, email) are required'
      });
    }

    // Check if footer already exists
    let footer = await Footer.findOne();

    if (footer) {
      // Update existing record
      footer.contact = contact;
      footer.navigate = navigate;
      footer.menu = menu;
      footer.socialMedia = socialMedia;
      footer.updatedAt = Date.now();

      await footer.save();
    } else {
      // Create new record
      footer = new Footer({
        contact,
        navigate,
        menu,
        socialMedia
      });

      await footer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Footer updated successfully',
      data: footer
    });

  } catch (error) {
    console.error('Error updating footer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update footer',
      error: error.message
    });
  }
};

// Get Footer Data
export const getFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne();

    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: footer
    });

  } catch (error) {
    console.error('Error fetching footer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer',
      error: error.message
    });
  }
};
