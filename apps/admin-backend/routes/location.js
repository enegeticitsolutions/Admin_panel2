const express = require('express');
const router = express.Router();
const ApiError = require('../utils/ApiError');


// GET /api/location/config
// Returns the Google Maps API key to the authenticated frontend
router.get('/config', (req, res, next) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'Google Maps API key is not configured on the server');
    }
    
    res.json({
      success: true,
      data: {
        apiKey: apiKey
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/location/geocode
// Converts an address string into lat/long coordinates using Google Geocoding API
router.get('/geocode', async (req, res, next) => {
  try {
    const { address } = req.query;
    if (!address) {
      throw new ApiError(400, 'Address is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'Google Maps API key is not configured on the server');
    }

    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results[0]) {
      const location = data.results[0].geometry.location;
      return res.json({
        success: true,
        data: {
          latitude: location.lat,
          longitude: location.lng,
          formattedAddress: data.results[0].formatted_address
        }
      });
    }

    // Fallback to OpenStreetMap Nominatim Geocoding if Google API key has referer/quota restrictions
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=in&limit=1`;
      const osmRes = await fetch(osmUrl, {
        headers: { 'User-Agent': 'MaiHoonNa-Admin/1.0 (contact@maihoonna.com)' }
      });
      const osmData = await osmRes.json();
      if (osmData && osmData.length > 0) {
        return res.json({
          success: true,
          data: {
            latitude: parseFloat(osmData[0].lat),
            longitude: parseFloat(osmData[0].lon),
            formattedAddress: osmData[0].display_name
          }
        });
      }
    } catch (osmErr) {
      console.warn('OSM Geocode fallback error:', osmErr.message);
    }

    throw new ApiError(404, `Could not find coordinates for "${address}"`);
  } catch (err) {
    next(err);
  }
});

// GET /api/location/reverse-geocode
// Converts lat/long coordinates into a human-readable address
router.get('/reverse-geocode', async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      throw new ApiError(400, 'Latitude and Longitude are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new ApiError(500, 'Google Maps API key is not configured on the server');
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new ApiError(500, `Reverse geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    const components = result.address_components;
    
    let city = '';
    let state = '';
    let pincode = '';
    
    components.forEach(c => {
      if (c.types.includes('locality')) city = c.long_name;
      if (c.types.includes('administrative_area_level_1')) state = c.long_name;
      if (c.types.includes('postal_code')) pincode = c.long_name;
      // Fallback for city if locality is not present
      if (!city && c.types.includes('administrative_area_level_2')) city = c.long_name;
    });

    res.json({
      success: true,
      data: {
        fullAddress: result.formatted_address,
        city,
        state,
        pincode,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
