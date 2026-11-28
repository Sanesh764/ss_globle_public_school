import crypto from 'node:crypto';

const APPLICATION_NUMBER_PREFIX = 'SSG';
const APPLICATION_TIMEZONE = 'Asia/Kolkata';

const getIndiaYear = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: APPLICATION_TIMEZONE,
    year: 'numeric',
  }).format(date);
};

/**
 * Generates a unique, human-readable application reference number
 * in the format SSG-YYYY-XXXXXXXXXXXXXXXX using Node.js built-in crypto
 * and the Asia/Kolkata timezone year.
 *
 * @param {Date} [referenceDate=new Date()] Optional date used only to derive the year.
 * @returns {string} Generated application number (e.g. "SSG-2026-A8F31C92B4E7091D")
 */
export const generateApplicationNumber = (referenceDate = new Date()) => {
  const date = referenceDate instanceof Date && !Number.isNaN(referenceDate.getTime())
    ? referenceDate
    : new Date();

  const year = getIndiaYear(date);
  const randomToken = crypto.randomBytes(8).toString('hex').toUpperCase();

  return `${APPLICATION_NUMBER_PREFIX}-${year}-${randomToken}`;
};

export default generateApplicationNumber;
