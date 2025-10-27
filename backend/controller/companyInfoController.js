import CompanyInfo from '../models/companyInfo.js';

export const updateCompanyInfo = async (req, res) => {
  try {
    const { companyName, address, email } = req.body;

    // Validate required fields
    if (!companyName || !address || !email) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Company logo is required'
      });
    }

    const logoPath = `/uploads/images/${req.file.filename}`;

    // Check if company info exists
    let companyInfo = await CompanyInfo.findOne();

    if (companyInfo) {
      // Update existing
      companyInfo.companyName = companyName;
      companyInfo.address = address;
      companyInfo.email = email;
      companyInfo.logoPath = logoPath;
      companyInfo.updatedAt = Date.now();

      await companyInfo.save();
    } else {
      // Create new
      companyInfo = new CompanyInfo({
        companyName,
        address,
        email,
        logoPath
      });

      await companyInfo.save();
    }

    res.status(200).json({
      success: true,
      message: 'Company information updated successfully',
      data: companyInfo
    });

  } catch (error) {
    console.error('Error updating company info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company information',
      error: error.message
    });
  }
};

// Get Company Info
export const getCompanyInfo = async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne();

    if (!companyInfo) {
      return res.status(404).json({
        success: false,
        message: 'Company information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: companyInfo
    });

  } catch (error) {
    console.error('Error fetching company info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company information',
      error: error.message
    });
  }
};
