import UserStats from '../models/userStats.model.js';

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

