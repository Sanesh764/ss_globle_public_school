import Setting from '../models/Setting.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get website settings
// @route   GET /api/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }

  res.status(200).json(new ApiResponse(200, { settings }, 'Website settings retrieved'));
});

// @desc    Update website settings
// @route   PUT /api/settings
// @access  Private/SuperAdmin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = new Setting();
  }

  const {
    schoolName,
    tagline,
    favicon,
    admissionButtonText,
    admissionButtonLink,
    address,
    phone,
    altPhone,
    email,
    officeHours,
    googleMapUrl,
    aboutHeroTitle,
    aboutHeroSubtitle,
    aboutBadge,
    aboutTitle,
    aboutText,
    aboutText1,
    aboutText2,
    aboutExpNumber,
    aboutExpText,
    aboutFeatures,
    aboutFeaturesList,
    aboutButtonText,
    aboutButtonLink,
    principalName,
    principalMessage,
    directorName,
    directorMessage,
    vision,
    mission,
    facebook,
    twitter,
    instagram,
    youtube,
  } = req.body;

  // Handle uploaded files (logo, aboutImage, aboutHeroBgImage)
  if (req.files) {
    if (req.files.logo && req.files.logo[0]) {
      if (settings.logoPublicId || settings.logo) {
        await deleteUploadedFile(settings.logoPublicId || settings.logo);
      }
      const uploadResult = await processUploadedFile(req.files.logo[0], 'ss_global_logo');
      settings.logo = uploadResult.url;
      settings.logoPublicId = uploadResult.public_id;
    }

    if (req.files.aboutImage && req.files.aboutImage[0]) {
      if (settings.aboutImagePublicId || settings.aboutImage) {
        await deleteUploadedFile(settings.aboutImagePublicId || settings.aboutImage);
      }
      const uploadResult = await processUploadedFile(req.files.aboutImage[0], 'ss_global_about');
      settings.aboutImage = uploadResult.url;
      settings.aboutImagePublicId = uploadResult.public_id;
    }

    if (req.files.aboutHeroBgImage && req.files.aboutHeroBgImage[0]) {
      if (settings.aboutHeroBgImagePublicId || settings.aboutHeroBgImage) {
        await deleteUploadedFile(settings.aboutHeroBgImagePublicId || settings.aboutHeroBgImage);
      }
      const uploadResult = await processUploadedFile(req.files.aboutHeroBgImage[0], 'ss_global_about_hero');
      settings.aboutHeroBgImage = uploadResult.url;
      settings.aboutHeroBgImagePublicId = uploadResult.public_id;
    }

    if (req.files.principalPhoto && req.files.principalPhoto[0]) {
      if (settings.principalPhotoPublicId || settings.principalPhoto) {
        await deleteUploadedFile(settings.principalPhotoPublicId || settings.principalPhoto);
      }
      const uploadResult = await processUploadedFile(req.files.principalPhoto[0], 'ss_global_principal');
      settings.principalPhoto = uploadResult.url;
      settings.principalPhotoPublicId = uploadResult.public_id;
    }

    if (req.files.directorPhoto && req.files.directorPhoto[0]) {
      if (settings.directorPhotoPublicId || settings.directorPhoto) {
        await deleteUploadedFile(settings.directorPhotoPublicId || settings.directorPhoto);
      }
      const uploadResult = await processUploadedFile(req.files.directorPhoto[0], 'ss_global_director');
      settings.directorPhoto = uploadResult.url;
      settings.directorPhotoPublicId = uploadResult.public_id;
    }
  } else if (req.file) {
    // Single file upload fallback
    const uploadResult = await processUploadedFile(req.file, 'ss_global_logo');
    settings.logo = uploadResult.url;
    settings.logoPublicId = uploadResult.public_id;
  }

  // Branding
  if (schoolName !== undefined) settings.schoolName = schoolName;
  if (tagline !== undefined) settings.tagline = tagline;
  if (favicon !== undefined) settings.favicon = favicon;
  if (admissionButtonText !== undefined) settings.admissionButtonText = admissionButtonText;
  if (admissionButtonLink !== undefined) settings.admissionButtonLink = admissionButtonLink;

  // Contact Info
  if (address !== undefined) settings.address = address;
  if (phone !== undefined) settings.phone = phone;
  if (altPhone !== undefined) settings.altPhone = altPhone;
  if (email !== undefined) settings.email = email;
  if (officeHours !== undefined) settings.officeHours = officeHours;
  if (googleMapUrl !== undefined) settings.googleMapUrl = googleMapUrl;

  // About Hero
  if (aboutHeroTitle !== undefined) settings.aboutHeroTitle = aboutHeroTitle;
  if (aboutHeroSubtitle !== undefined) settings.aboutHeroSubtitle = aboutHeroSubtitle;

  // About Section
  if (aboutBadge !== undefined) settings.aboutBadge = aboutBadge;
  if (aboutTitle !== undefined) settings.aboutTitle = aboutTitle;
  if (aboutText !== undefined) settings.aboutText = aboutText;
  if (aboutText1 !== undefined) settings.aboutText1 = aboutText1;
  if (aboutText2 !== undefined) settings.aboutText2 = aboutText2;
  if (aboutExpNumber !== undefined) settings.aboutExpNumber = aboutExpNumber;
  if (aboutExpText !== undefined) settings.aboutExpText = aboutExpText;
  if (aboutButtonText !== undefined) settings.aboutButtonText = aboutButtonText;
  if (aboutButtonLink !== undefined) settings.aboutButtonLink = aboutButtonLink;

  if (aboutFeatures !== undefined) {
    if (typeof aboutFeatures === 'string') {
      try {
        settings.aboutFeatures = JSON.parse(aboutFeatures);
      } catch (err) {
        settings.aboutFeatures = aboutFeatures.split(',').map((f) => f.trim()).filter(Boolean);
      }
    } else if (Array.isArray(aboutFeatures)) {
      settings.aboutFeatures = aboutFeatures;
    }
  }

  if (aboutFeaturesList !== undefined) {
    if (typeof aboutFeaturesList === 'string') {
      try {
        settings.aboutFeaturesList = JSON.parse(aboutFeaturesList);
      } catch (err) {
        // Fallback
      }
    } else if (Array.isArray(aboutFeaturesList)) {
      settings.aboutFeaturesList = aboutFeaturesList;
    }
  }

  // Leadership & Messages
  if (principalName !== undefined) settings.principalName = principalName;
  if (principalMessage !== undefined) settings.principalMessage = principalMessage;
  if (directorName !== undefined) settings.directorName = directorName;
  if (directorMessage !== undefined) settings.directorMessage = directorMessage;
  if (vision !== undefined) settings.vision = vision;
  if (mission !== undefined) settings.mission = mission;

  // Social Links
  settings.socialLinks = {
    facebook: facebook !== undefined ? facebook : settings.socialLinks?.facebook || '',
    twitter: twitter !== undefined ? twitter : settings.socialLinks?.twitter || '',
    instagram: instagram !== undefined ? instagram : settings.socialLinks?.instagram || '',
    youtube: youtube !== undefined ? youtube : settings.socialLinks?.youtube || '',
  };

  const updatedSettings = await settings.save();

  res.status(200).json(
    new ApiResponse(200, { settings: updatedSettings }, 'Website settings updated successfully')
  );
});
