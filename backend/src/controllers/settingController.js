import Setting from '../models/Setting.js';
import { processUploadedFile } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({
      schoolName: 'S.S. Global Public School',
      address: 'Daudnagar, Bihar - 824143, India',
    });
  }

  res.status(200).json(new ApiResponse(200, { settings }, 'Website settings retrieved'));
});

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting();
  }

  const {
    schoolName,
    tagline,
    address,
    phone,
    altPhone,
    email,
    principalName,
    principalMessage,
    directorName,
    directorMessage,
    about,
    vision,
    mission,
    officeHours,
    googleMapUrl,
    facebook,
    twitter,
    instagram,
    youtube,
  } = req.body;

  if (req.file) {
    const uploadResult = await processUploadedFile(req.file, 'ss_global_logo');
    settings.logo = uploadResult.url;
  }

  if (schoolName) settings.schoolName = schoolName;
  if (tagline) settings.tagline = tagline;
  if (address) settings.address = address;
  if (phone) settings.phone = phone;
  if (altPhone !== undefined) settings.altPhone = altPhone;
  if (email) settings.email = email;
  if (principalName) settings.principalName = principalName;
  if (principalMessage) settings.principalMessage = principalMessage;
  if (directorName) settings.directorName = directorName;
  if (directorMessage) settings.directorMessage = directorMessage;
  if (about) settings.about = about;
  if (vision) settings.vision = vision;
  if (mission) settings.mission = mission;
  if (officeHours) settings.officeHours = officeHours;
  if (googleMapUrl) settings.googleMapUrl = googleMapUrl;

  settings.socialLinks = {
    facebook: facebook || settings.socialLinks?.facebook || '',
    twitter: twitter || settings.socialLinks?.twitter || '',
    instagram: instagram || settings.socialLinks?.instagram || '',
    youtube: youtube || settings.socialLinks?.youtube || '',
  };

  const updatedSettings = await settings.save();

  res.status(200).json(
    new ApiResponse(200, { settings: updatedSettings }, 'Website settings updated successfully')
  );
});
