/**
 * REFERENCE IMPLEMENTATION: Admin Dashboard API
 *
 * Copy this into your Node/Express backend and wire to your User model and auth.
 * - Adjust import paths (User model, auth middleware).
 * - Ensure GET /admin/dashboard-analytics and GET /admin/user-details/:username
 *   are registered and protected by verifyAdmin (or equivalent).
 *
 * Frontend expects: GET with Authorization: Bearer <token>
 * Admin usernames: "inseo", "yoobin"
 */

// const User = require('../models/User'); // your User model
// const { verifyAuth } = require('../middleware/auth'); // ensure req.user is set

const ADMIN_USERNAMES = ["inseo", "yoobin"];

function verifyAdmin(req, res, next) {
  const user = req.user;
  if (!user || !ADMIN_USERNAMES.includes(user.username)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * GET /admin/dashboard-analytics
 * Aggregate metrics from ALL users (placeVisitHistory).
 */
async function getDashboardAnalytics(req, res) {
  try {
    const allUsers = await User.find({})
      .select("username email createdAt placeVisitHistory friends")
      .lean();

    const analytics = calculateAnalytics(allUsers);
    res.json(analytics);
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
}

function calculateAnalytics(users) {
  let totalPlaces = 0;
  let totalPhotos = 0;
  let totalComments = 0;
  let totalAudioCaptions = 0;
  let totalStories = 0;
  const poiAccuracyData = [];
  const placesByCountry = {};
  const placesByCity = {};
  const placesByCategory = {};
  const userActivityMap = new Map();

  users.forEach((user) => {
    const visitHistory = user.placeVisitHistory || [];

    visitHistory.forEach((place) => {
      if (place.status === "hidden") return;

      totalPlaces++;

      if (place.country) {
        placesByCountry[place.country] =
          (placesByCountry[place.country] || 0) + 1;
      }
      if (place.city) {
        const cityKey = `${place.city}, ${place.country}`;
        placesByCity[cityKey] = (placesByCity[cityKey] || 0) + 1;
      }
      if (place.categories && place.categories.length > 0) {
        place.categories.forEach((cat) => {
          if (cat) {
            placesByCategory[cat] = (placesByCategory[cat] || 0) + 1;
          }
        });
      }

      if (place.suggestedList) {
        try {
          const suggestions = JSON.parse(place.suggestedList);
          const selectedIndex = place.selectedIndex;
          if (selectedIndex >= 0) {
            poiAccuracyData.push({
              selectedIndex,
              totalSuggestions: suggestions.length,
              wasTopThree: selectedIndex < 3,
              wasTopTen: selectedIndex < 10,
              wasTopForty: selectedIndex < 40,
            });
          }
        } catch (e) {
          // invalid JSON
        }
      }

      if (place.photoList && place.photoList.length > 0) {
        totalPhotos += place.photoList.length;
        place.photoList.forEach((photo) => {
          if (photo.story) totalStories++;
          if (photo.audio || photo.storyAudio) totalAudioCaptions++;
          if (photo.comments && photo.comments.length > 0) {
            totalComments += photo.comments.length;
            photo.comments.forEach((comment) => {
              if (comment.replies && comment.replies.length > 0) {
                totalComments += comment.replies.length;
              }
            });
          }
        });
      }

      if (!userActivityMap.has(user.username)) {
        userActivityMap.set(user.username, {
          username: user.username,
          placesAdded: 0,
          photosAdded: 0,
          joinedDate: user.createdAt,
        });
      }
      const userStats = userActivityMap.get(user.username);
      userStats.placesAdded++;
      userStats.photosAdded += place.photoList?.length || 0;
    });
  });

  const poiAccuracy = {
    topThreeAccuracy:
      poiAccuracyData.length > 0
        ? (
            (poiAccuracyData.filter((d) => d.wasTopThree).length /
              poiAccuracyData.length) *
            100
          ).toFixed(2)
        : "0",
    topTenAccuracy:
      poiAccuracyData.length > 0
        ? (
            (poiAccuracyData.filter((d) => d.wasTopTen).length /
              poiAccuracyData.length) *
            100
          ).toFixed(2)
        : "0",
    topFortyAccuracy:
      poiAccuracyData.length > 0
        ? (
            (poiAccuracyData.filter((d) => d.wasTopForty).length /
              poiAccuracyData.length) *
            100
          ).toFixed(2)
        : "0",
    totalSelections: poiAccuracyData.length,
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersLast30Days = users.filter(
    (u) => new Date(u.createdAt) > thirtyDaysAgo,
  ).length;

  const totalUsers = users.length;
  const avgPlacesPerUser =
    totalUsers > 0 ? (totalPlaces / totalUsers).toFixed(2) : "0";
  const avgPhotosPerPlace =
    totalPlaces > 0 ? (totalPhotos / totalPlaces).toFixed(2) : "0";
  const photosWithStoryPercentage =
    totalPhotos > 0 ? ((totalStories / totalPhotos) * 100).toFixed(2) : "0";
  const audioCaptionPercentage =
    totalPhotos > 0
      ? ((totalAudioCaptions / totalPhotos) * 100).toFixed(2)
      : "0";

  return {
    overview: {
      totalUsers,
      totalPlaces,
      totalPhotos,
      totalComments,
      newUsersLast30Days,
      avgPlacesPerUser,
      avgPhotosPerPlace,
    },
    poiAccuracy,
    geography: {
      placesByCountry: Object.entries(placesByCountry)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
      placesByCity: Object.entries(placesByCity)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20),
    },
    categories: Object.entries(placesByCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / totalPlaces) * 100).toFixed(2),
      })),
    topActiveUsers: Array.from(userActivityMap.values())
      .sort((a, b) => b.placesAdded - a.placesAdded)
      .slice(0, 10),
    engagement: {
      photosWithStoryPercentage,
      audioCaptionPercentage,
      totalStories,
      totalAudioCaptions,
    },
  };
}

/**
 * GET /admin/user-details/:username
 */
async function getUserDetails(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select("username email createdAt placeVisitHistory friends")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userMetrics = calculateUserMetrics(user);
    res.json(userMetrics);
  } catch (error) {
    console.error("User details error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
}

function calculateUserMetrics(user) {
  const visitHistory = user.placeVisitHistory || [];
  let totalPlaces = 0;
  const placesByCountry = {};
  const placesByCity = {};
  const placesByCategory = {};
  let totalPhotos = 0;
  let photosWithStory = 0;
  let audioCount = 0;
  let totalStoryLength = 0;
  let storyCount = 0;

  visitHistory.forEach((place) => {
    if (place.status === "hidden") return;

    totalPlaces++;
    if (place.country) {
      placesByCountry[place.country] =
        (placesByCountry[place.country] || 0) + 1;
    }
    if (place.city) {
      placesByCity[place.city] = (placesByCity[place.city] || 0) + 1;
    }
    place.categories?.forEach((cat) => {
      if (cat) placesByCategory[cat] = (placesByCategory[cat] || 0) + 1;
    });

    if (place.photoList) {
      totalPhotos += place.photoList.length;
      place.photoList.forEach((photo) => {
        if (photo.story) {
          photosWithStory++;
          totalStoryLength += photo.story.length;
          storyCount++;
        }
        if (photo.audio || photo.storyAudio) audioCount++;
      });
    }
  });

  const friendCount = Array.isArray(user.friends) ? user.friends.length : 0;

  return {
    username: user.username,
    joinedDate: user.createdAt,
    totalPlaces,
    totalPhotos,
    placesByCountry,
    placesByCity,
    placesByCategory: Object.entries(placesByCategory).map(
      ([category, count]) => ({
        category,
        count,
        percentage:
          totalPlaces > 0 ? ((count / totalPlaces) * 100).toFixed(2) : "0",
      }),
    ),
    avgPhotosPerPlace:
      totalPlaces > 0 ? (totalPhotos / totalPlaces).toFixed(2) : "0",
    photosWithStoryPercentage:
      totalPhotos > 0
        ? ((photosWithStory / totalPhotos) * 100).toFixed(2)
        : "0",
    audioCaptionPercentage:
      totalPhotos > 0 ? ((audioCount / totalPhotos) * 100).toFixed(2) : "0",
    avgStoryLength:
      storyCount > 0 ? Math.round(totalStoryLength / storyCount) : 0,
    friendCount,
  };
}

// Example route registration (Express):
// router.get('/admin/dashboard-analytics', verifyAuth, verifyAdmin, getDashboardAnalytics);
// router.get('/admin/user-details/:username', verifyAuth, verifyAdmin, getUserDetails);

module.exports = {
  verifyAdmin,
  getDashboardAnalytics,
  getUserDetails,
  calculateAnalytics,
  calculateUserMetrics,
};
