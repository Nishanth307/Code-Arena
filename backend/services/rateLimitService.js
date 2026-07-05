const AIAnalysisLimit = require("../model/aiAnalysisLimit");

const getDailyLimit = () => {
    const limit = parseInt(process.env.AI_ANALYSIS_DAILY_LIMIT, 10);
    return isNaN(limit) ? 2 : limit;
};

const getTodayDateString = () => {
    const d = new Date();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getRemainingQuota = async (userId) => {
    const dateStr = getTodayDateString();
    const limitDoc = await AIAnalysisLimit.findOne({ userId, date: dateStr });
    const limitMax = getDailyLimit();
    const count = limitDoc ? limitDoc.count : 0;
    return Math.max(0, limitMax - count);
};

const checkAndIncrementQuota = async (userId) => {
    const dateStr = getTodayDateString();
    const limitMax = getDailyLimit();
    
    const limitDoc = await AIAnalysisLimit.findOneAndUpdate(
        { userId, date: dateStr },
        { $setOnInsert: { userId, date: dateStr, count: 0 } },
        { upsert: true, new: true }
    );

    if (limitDoc.count >= limitMax) {
        return false;
    }

    await AIAnalysisLimit.updateOne(
        { _id: limitDoc._id },
        { $inc: { count: 1 } }
    );

    return true;
};

module.exports = {
    getDailyLimit,
    getRemainingQuota,
    checkAndIncrementQuota
};
