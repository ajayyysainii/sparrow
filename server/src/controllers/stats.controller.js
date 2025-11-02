import UserStats from '../models/userStats.model.js';
import VoiceHealthReport from '../models/voiceHealthReport.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import moment from 'moment-timezone';
import mongoose from 'mongoose';

// List of all exercise IDs
const ALL_EXERCISES = [
  'diaphragmatic',
  'square',
  'sustained',
  'slides',
  'scale',
  'intervals',
  'tongue-twisters',
  'lip-trills',
  'diction',
];

export class StatsController {
  // Get user stats
  getStats = async (req, res) => {
    try {
      const userId = req.user.userId;
      const today = new Date().toISOString().split('T')[0];

      let stats = await UserStats.findOne({ userId });

      // If no stats exist, create default stats
      if (!stats) {
        stats = await UserStats.create({
          userId,
          streak: 0,
          lastCompletedDate: null,
          totalPoints: 0,
          completedExercisesToday: [],
          lastCompletedExerciseDate: null,
        });
      }

      // Reset completed exercises if it's a new day
      if (stats.lastCompletedExerciseDate !== today) {
        stats.completedExercisesToday = [];
        stats.lastCompletedExerciseDate = today;
        await stats.save();
      }

      // Ensure array doesn't have duplicates (safety check)
      if (stats.completedExercisesToday && stats.completedExercisesToday.length > 0) {
        const uniqueExercises = [...new Set(stats.completedExercisesToday)];
        if (uniqueExercises.length !== stats.completedExercisesToday.length) {
          stats.completedExercisesToday = uniqueExercises;
          await stats.save();
        }
      }

      res.status(200).json({
        userId: stats.userId,
        streak: stats.streak,
        lastCompletedDate: stats.lastCompletedDate,
        totalPoints: stats.totalPoints,
        completedExercisesToday: stats.completedExercisesToday || [],
        totalExercises: ALL_EXERCISES.length,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // Complete exercise and update stats
  completeExercise = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { exerciseId } = req.body;
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format

      if (!exerciseId) {
        return res.status(400).json({ message: 'Exercise ID is required' });
      }

      // Validate exercise ID
      if (!ALL_EXERCISES.includes(exerciseId)) {
        return res.status(400).json({ message: 'Invalid exercise ID' });
      }

      let stats = await UserStats.findOne({ userId });

      // If no stats exist, create default stats
      if (!stats) {
        stats = await UserStats.create({
          userId,
          streak: 0,
          lastCompletedDate: null,
          totalPoints: 0,
          completedExercisesToday: [],
          lastCompletedExerciseDate: null,
        });
      }

      // Reset completed exercises if it's a new day
      if (stats.lastCompletedExerciseDate !== today) {
        stats.completedExercisesToday = [];
        stats.lastCompletedExerciseDate = today;
      }

      // Ensure array doesn't have duplicates (safety check)
      stats.completedExercisesToday = [...new Set(stats.completedExercisesToday)];

      // Check if this exercise is already completed today
      if (stats.completedExercisesToday.includes(exerciseId)) {
        // Remove duplicates again before returning
        stats.completedExercisesToday = [...new Set(stats.completedExercisesToday)];
        await stats.save();
        
        return res.status(200).json({
          userId: stats.userId,
          streak: stats.streak,
          lastCompletedDate: stats.lastCompletedDate,
          totalPoints: stats.totalPoints,
          completedExercisesToday: stats.completedExercisesToday,
          totalExercises: ALL_EXERCISES.length,
          streakRestarted: false,
          pointsEarned: 0,
          message: 'Exercise already completed today',
          allCompleted: false,
        });
      }

      // Add exercise to completed list (using Set to ensure uniqueness)
      stats.completedExercisesToday = [...new Set([...stats.completedExercisesToday, exerciseId])];
      
      // Save immediately to persist the deduplicated array
      await stats.save();

      // Check if all exercises are completed (after deduplication)
      const allCompleted = ALL_EXERCISES.every(exId => 
        stats.completedExercisesToday.includes(exId)
      );

      let newStreak = stats.streak;
      let streakRestarted = false;
      let pointsEarned = 0;

      // Only award points and streak if ALL exercises are completed
      if (allCompleted) {
        const lastDate = stats.lastCompletedDate;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if already awarded points today (already completed all exercises today)
        if (lastDate === today) {
          // Already completed all exercises today - don't award again
          await stats.save();
          return res.status(200).json({
            userId: stats.userId,
            streak: stats.streak,
            lastCompletedDate: stats.lastCompletedDate,
            totalPoints: stats.totalPoints,
            completedExercisesToday: stats.completedExercisesToday,
            totalExercises: ALL_EXERCISES.length,
            streakRestarted: false,
            pointsEarned: 0,
            message: 'All exercises already completed today',
            allCompleted: true,
          });
        }

        // Award points and update streak
        pointsEarned = 10;
        stats.totalPoints = stats.totalPoints + 10;

        // Check if streak should continue or reset
        if (!lastDate) {
          // First time completing all exercises
          newStreak = 1;
        } else if (lastDate === yesterdayStr) {
          // Completed all exercises yesterday, continue streak
          newStreak = stats.streak + 1;
        } else {
          // Missed days, restart streak
          newStreak = 1;
          streakRestarted = true;
        }

        stats.streak = newStreak;
        stats.lastCompletedDate = today;
      }

      // Ensure no duplicates before final save
      stats.completedExercisesToday = [...new Set(stats.completedExercisesToday)];
      await stats.save();

      res.status(200).json({
        userId: stats.userId,
        streak: stats.streak,
        lastCompletedDate: stats.lastCompletedDate,
        totalPoints: stats.totalPoints,
        completedExercisesToday: stats.completedExercisesToday,
        totalExercises: ALL_EXERCISES.length,
        streakRestarted,
        pointsEarned,
        allCompleted,
        message: allCompleted ? 'All exercises completed! Points and streak updated.' : 'Exercise completed. Continue to earn points.',
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export const getDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Get recent reports (last 5)
    const recentReports = await VoiceHealthReport.find({ userId })
        .sort({ analysisDate: -1 })
        .limit(5)
        .lean();

    // Latest report details
    const latestReport = recentReports[0] || null;

    // Aggregate average jitter, shimmer, and MFCCs
    const averageMetrics = await VoiceHealthReport.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                avgJitter: { $avg: { $ifNull: ["$acousticFeatures.Jitter_Percent", 0] } },
                avgShimmer: { $avg: { $ifNull: ["$acousticFeatures.Shimmer_Percent", 0] } },
                mfccMean: { $avg: { $ifNull: ["$acousticFeatures.MFCC_Mean", []] } },
                mfccStd: { $avg: { $ifNull: ["$acousticFeatures.MFCC_Std", []] } },
            },
        },
    ]);

    // Weekly Data for Line Chart
    const weeklyData = await VoiceHealthReport.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $addFields: {
                analysisDateAsDate: { $toDate: "$analysisDate" }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$analysisDateAsDate" } },
                avgJitter: { $avg: { $ifNull: ["$acousticFeatures.Jitter_Percent", 0] } },
                avgShimmer: { $avg: { $ifNull: ["$acousticFeatures.Shimmer_Percent", 0] } },
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Prediction Distribution for Pie Chart
    const predictionDistribution = await VoiceHealthReport.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: "$prediction",
                count: { $sum: 1 },
            },
        },
    ]);

    const formattedPredictions = {};
    predictionDistribution.forEach((entry) => {
        formattedPredictions[entry._id] = entry.count;
    });

    // Exercise Progress
    const today = moment().tz("Asia/Kolkata").format("YYYY-MM-DD");
    // Note: Exercise model not found in codebase - setting to default values
    // const todayExercises = await Exercise.findOne({ userId, date: today });
    const todayExercises = null;

    res.json({
        success: true,
        data: {
            recentReports,
            latestReport,
            averages: averageMetrics.length > 0 ? averageMetrics[0] : { avgJitter: 0, avgShimmer: 0, mfccMean: [], mfccStd: [] },
            weeklyData: weeklyData.map((entry) => ({
                date: entry._id,
                jitter: entry.avgJitter,
                shimmer: entry.avgShimmer,
            })),
            predictionDistribution: formattedPredictions,
            exerciseProgress: {
                completed: todayExercises?.completedExercises.length || 0,
                total: 9, // Total exercises available
            },
        },
    });
});

