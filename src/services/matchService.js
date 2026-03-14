const matchRepository = require('../repositories/matchRepository');
const messageRepository = require('../repositories/messageRepository');
const userRepository = require('../repositories/userRepository');

class MatchService {

    // ── Like a User (Initiate Match) ────────────────────────
    async likeUser(userId, matchedUserId) {
        if (userId === matchedUserId) throw new Error('You cannot match with yourself');

        // Check if target user exists
        const targetUser = await userRepository.findById(matchedUserId);
        if (!targetUser) throw new Error('Target user not found');

        // Check if match already exists in either direction
        const existingMatch = await matchRepository.findByUsers(userId, matchedUserId);
        if (existingMatch) {
            // If the other user already liked or super_liked us, upgrade to mutual_match
            if (existingMatch.userId === matchedUserId &&
                (existingMatch.status === 'like' || existingMatch.status === 'super_like')) {
                const updated = await matchRepository.update(existingMatch.id, {
                    status: 'mutual_match',
                    matchedAt: new Date(),
                    isNewMatch: true
                });
                return { match: updated, isMutual: true, message: 'It\'s a match!' };
            }
            throw new Error('Match already exists');
        }

        // Create a new like
        const match = await matchRepository.create({
            userId,
            matchedUserId,
            status: 'like'
        });

        return { match, isMutual: false, message: 'Like sent successfully' };
    }

    // ── Super Like a User ───────────────────────────────────
    async superLikeUser(userId, matchedUserId) {
        if (userId === matchedUserId) throw new Error('You cannot super like yourself');

        // Check if target user exists
        const targetUser = await userRepository.findById(matchedUserId);
        if (!targetUser) throw new Error('Target user not found');

        // Check if match already exists in either direction
        const existingMatch = await matchRepository.findByUsers(userId, matchedUserId);
        if (existingMatch) {
            // If the other user already liked/super_liked us, upgrade to mutual_match
            if (existingMatch.userId === matchedUserId &&
                (existingMatch.status === 'like' || existingMatch.status === 'super_like')) {
                const updated = await matchRepository.update(existingMatch.id, {
                    status: 'mutual_match',
                    isSuperLike: true,
                    matchedAt: new Date(),
                    isNewMatch: true
                });
                return { match: updated, isMutual: true, isSuperLike: true, message: 'It\'s a super match!' };
            }
            throw new Error('Match already exists');
        }

        // Create a new super like
        const match = await matchRepository.create({
            userId,
            matchedUserId,
            status: 'super_like',
            isSuperLike: true
        });

        return { match, isMutual: false, isSuperLike: true, message: 'Super like sent successfully' };
    }

    // ── Get All Matches for User ────────────────────────────
    async getMatchesForUser(userId) {
        const matches = await matchRepository.findMatchesForUser(userId);

        return matches.map(m => {
            // Determine the other user in the match
            const otherUser = m.userId === userId ? m.MatchedUser : m.Initiator;
            const lastMessage = m.Messages.length ? m.Messages[0] : null;

            // Build images array from Photos
            const images = (otherUser.Photos || []).map(p => p.url);
            if (images.length === 0 && otherUser.profilePicture) {
                images.push(otherUser.profilePicture);
            }

            // Build badges array
            const badges = (otherUser.Badges || []).map(b => ({
                id: b.id,
                name: b.name,
                icon: b.icon,
                color: b.color,
                isPremium: b.isPremium
            }));

            return {
                matchId: m.id,
                isSuperLike: m.isSuperLike || false,
                matchedAt: m.matchedAt,
                isNewMatch: m.isNewMatch,
                hasUnreadMessages: m.hasUnreadMessages,
                lastMessage: lastMessage ? {
                    messageId: lastMessage.id,
                    text: lastMessage.text,
                    senderId: lastMessage.senderId,
                    sentAt: lastMessage.sentAt
                } : null,
                user: {
                    userId: otherUser.id,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    age: otherUser.age,
                    profilePicture: otherUser.profilePicture,
                    images,
                    location: otherUser.location,
                    bio: otherUser.bio,
                    interests: otherUser.interests || [],
                    isOnline: otherUser.isOnline || false,
                    occupation: otherUser.occupation,
                    education: otherUser.education,
                    badges
                }
            };
        });
    }

    // ── Get Match Summary (IDs only) ────────────────────────
    async getMatchSummary(userId) {
        const records = await matchRepository.findAllForUser(userId);

        const liked = [];
        const superLiked = [];
        const matched = [];

        for (const r of records) {
            const otherUserId = r.userId === userId ? r.matchedUserId : r.userId;

            if (r.status === 'mutual_match') {
                matched.push(otherUserId);
            } else if (r.userId === userId && r.status === 'like') {
                liked.push(otherUserId);
            } else if (r.userId === userId && r.status === 'super_like') {
                superLiked.push(otherUserId);
            }
        }

        return { liked, superLiked, matched };
    }

    // ── Get Match by ID ─────────────────────────────────────
    async getMatchById(matchId, userId) {
        const match = await matchRepository.findMatchWithMessages(matchId);
        if (!match) throw new Error('Match not found');

        // Ensure the requesting user is part of this match
        if (match.userId !== userId && match.matchedUserId !== userId) {
            throw new Error('Unauthorized to view this match');
        }

        return match;
    }

    // ── Send Message in a Match ─────────────────────────────
    async sendMessage(matchId, senderId, text) {
        const match = await matchRepository.findById(matchId);
        if (!match) throw new Error('Match not found');
        if (match.status !== 'mutual_match') throw new Error('Can only message mutual matches');

        // Ensure sender is part of this match
        if (match.userId !== senderId && match.matchedUserId !== senderId) {
            throw new Error('Unauthorized to send messages in this match');
        }

        const message = await messageRepository.create({
            matchId,
            senderId,
            text,
            sentAt: new Date()
        });

        // Mark match as having unread messages
        await matchRepository.update(matchId, { hasUnreadMessages: true, isNewMatch: false });

        return message;
    }

    // ── Get Messages for a Match ────────────────────────────
    async getMessages(matchId, userId) {
        const match = await matchRepository.findById(matchId);
        if (!match) throw new Error('Match not found');

        // Ensure user is part of this match
        if (match.userId !== userId && match.matchedUserId !== userId) {
            throw new Error('Unauthorized to view messages');
        }

        // Mark messages as read
        await matchRepository.update(matchId, { hasUnreadMessages: false });

        return await messageRepository.findByMatchId(matchId);
    }

    // ── Update Match Status ─────────────────────────────────
    async updateMatchStatus(matchId, userId, status) {
        const match = await matchRepository.findById(matchId);
        if (!match) throw new Error('Match not found');

        // Ensure user is part of this match
        if (match.userId !== userId && match.matchedUserId !== userId) {
            throw new Error('Unauthorized to update this match');
        }

        const validStatuses = ['hidden', 'blocked', 'unhide', 'unblock'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status. Allowed: hidden, blocked, unhide, unblock');
        }

        // unhide/unblock → restore back to mutual_match
        if (status === 'unhide' || status === 'unblock') {
            if (match.status === 'mutual_match') {
                return match; // already active, nothing to change
            }
            const updated = await matchRepository.update(matchId, { status: 'mutual_match' });
            return updated;
        }

        const updated = await matchRepository.update(matchId, { status });
        return updated;
    }

    // ── Unmatch (Delete match + messages) ────────────────────
    async unmatch(matchId, userId) {
        const match = await matchRepository.findById(matchId);
        if (!match) throw new Error('Match not found');

        // Ensure user is part of this match
        if (match.userId !== userId && match.matchedUserId !== userId) {
            throw new Error('Unauthorized to unmatch');
        }

        // Delete all messages for this match
        await messageRepository.deleteByMatchId(matchId);

        // Delete the match record
        await matchRepository.delete(matchId);

        return { message: 'Unmatched successfully' };
    }
}

module.exports = new MatchService();
