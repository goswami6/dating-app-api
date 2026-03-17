const matchCriteriaRepository = require('../repositories/matchCriteriaRepository');

class MatchCriteriaService {

    async getCriteria(userId) {
        const criteria = await matchCriteriaRepository.findByUserId(userId);
        if (!criteria) {
            // Return defaults if no criteria set
            return {
                userId,
                minAge: 18,
                maxAge: 50,
                maxDistance: 50.0,
                interests: [],
                gender: 'all',
                onlineOnly: false,
                incognitoMode: false,
                relationshipGoals: [],
                pronouns: [],
                height: null,
                languages: [],
                zodiacSign: null,
                educationLevel: null,
                familyPlan: null,
                communicationStyle: null,
                loveStyle: null,
                petPreference: null,
                drinking: null,
                smoking: null,
                workout: null,
                socialMedia: null,
                school: null,
                jobTitle: null,
                livingIn: null,
                sexualOrientation: []
            };
        }
        return criteria;
    }

    async setCriteria(userId, data) {
        // Validate age range
        if (data.minAge && data.maxAge && data.minAge > data.maxAge) {
            throw new Error('minAge cannot be greater than maxAge');
        }
        if (data.minAge && data.minAge < 18) {
            throw new Error('Minimum age must be at least 18');
        }
        if (data.maxDistance && data.maxDistance <= 0) {
            throw new Error('Max distance must be greater than 0');
        }

        const allowedFields = [
            'minAge', 'maxAge', 'maxDistance', 'interests', 'gender', 'onlineOnly', 'incognitoMode',
            'relationshipGoals', 'pronouns', 'height', 'languages', 'zodiacSign',
            'educationLevel', 'familyPlan', 'communicationStyle', 'loveStyle',
            'petPreference', 'drinking', 'smoking', 'workout', 'socialMedia',
            'school', 'jobTitle', 'livingIn', 'sexualOrientation'
        ];
        const filtered = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                filtered[key] = data[key];
            }
        }

        return await matchCriteriaRepository.createOrUpdate(userId, filtered);
    }

    async resetCriteria(userId) {
        const result = await matchCriteriaRepository.delete(userId);
        if (!result) throw new Error('No criteria found to reset');
        return { message: 'Match criteria reset to defaults' };
    }
}

module.exports = new MatchCriteriaService();
