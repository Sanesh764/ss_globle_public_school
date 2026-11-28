export const SCHOOL_SCHEMA_ID = 'https://www.ssglobalpublicschool.com/#school';

export const GOOGLE_MAPS_LISTING_URL =
  'https://www.google.com/maps/place/S.S.+Global+Public+School/@25.0235988,84.4291671,17z/data=!3m1!4b1!4m6!3m5!1s0x398d0fa70dd75f25:0xa0af282aa58127ee!8m2!3d25.0235988!4d84.4291671!16s%2Fg%2F11gkvf4ltp?entry=ttu';

/**
 * Single verified Schema.org School entity used consistently across the website.
 */
export const getSchoolSchema = ({ includeContext = true } = {}) => ({
  ...(includeContext ? { '@context': 'https://schema.org' } : {}),
  '@type': 'School',
  '@id': SCHOOL_SCHEMA_ID,
  name: 'S.S. Global Public School',
  alternateName: 'SS Global Public School Daudnagar',
  url: 'https://www.ssglobalpublicschool.com/',
  logo: 'https://www.ssglobalpublicschool.com/android-chrome-512x512.png',
  image: 'https://www.ssglobalpublicschool.com/school.webp',
  description:
    'CBSE-affiliated English medium school in Daudnagar, Aurangabad district, Bihar, offering education from Class 1 to Class 12.',
  telephone: '+919122490003',
  email: 'ssglobalpublicschool0@gmail.com',
  knowsLanguage: 'English',
  address: {
    '@type': 'PostalAddress',
    streetAddress: "Shambhu Nagar, Near Teacher's Training College",
    addressLocality: 'Daudnagar',
    addressRegion: 'Bihar',
    postalCode: '824143',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 25.0235988,
    longitude: 84.4291671,
  },
  hasMap: GOOGLE_MAPS_LISTING_URL,
  areaServed: [
    {
      '@type': 'City',
      name: 'Daudnagar',
    },
    {
      '@type': 'AdministrativeArea',
      name: 'Aurangabad District, Bihar',
    },
  ],
});
