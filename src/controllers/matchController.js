const matchService = require('../services/matchService');
const walletService = require('../services/walletService');
const apiResponse = require('../utils/apiResponse');

class MatchController {

    // POST /api/matches/like
    async likeUser(req, res) {
        try {
            const userId = req.user.id;
            const { matchedUserId } = req.body;

            if (!matchedUserId) {
                return apiResponse.error(res, 'matchedUserId is required', 400);
            }

            const result = await matchService.likeUser(userId, parseInt(matchedUserId));
            const statusCode = result.isMutual ? 200 : 201;
            return apiResponse.success(res, result.message, { match: result.match, isMutual: result.isMutual }, statusCode);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // POST /api/matches/super-like
    async superLikeUser(req, res) {
        try {
            const userId = req.user.id;
            const { matchedUserId } = req.body;

            if (!matchedUserId) {
                return apiResponse.error(res, 'matchedUserId is required', 400);
            }

            const result = await matchService.superLikeUser(userId, parseInt(matchedUserId));
            const statusCode = result.isMutual ? 200 : 201;
            return apiResponse.success(res, result.message, {
                match: result.match,
                isMutual: result.isMutual,
                isSuperLike: result.isSuperLike
            }, statusCode);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // GET /api/matches/summary
    async getMatchSummary(req, res) {
        try {
            const userId = req.user.id;
            const summary = await matchService.getMatchSummary(userId);
            return apiResponse.success(res, 'Match summary retrieved successfully', summary);
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // GET /api/matches
    async getMatches(req, res) {
        try {
            const userId = req.user.id;
            const matches = await matchService.getMatchesForUser(userId);
            return apiResponse.success(res, 'Matches retrieved successfully', {
                totalMatches: matches.length,
                matches
            });
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }

    // GET /api/matches/:matchId
    async getMatchById(req, res) {
        try {
            const userId = req.user.id;
            const matchId = parseInt(req.params.matchId);
            const match = await matchService.getMatchById(matchId, userId);
            return apiResponse.success(res, 'Match retrieved successfully', match);
        } catch (error) {
            return apiResponse.error(res, error.message, 404);
        }
    }

    // POST /api/matches/:matchId/messages
    async sendMessage(req, res) {
        try {
            const userId = req.user.id;
            const matchId = parseInt(req.params.matchId);
            const { text } = req.body;

            if (!text || !text.trim()) {
                return apiResponse.error(res, 'Message text is required', 400);
            }

            // Check wallet balance before sending
            const canChat = await walletService.canChat(userId);
            if (!canChat) {
                const wallet = await walletService.getWallet(userId);
                return apiResponse.error(res, 'Insufficient wallet balance for chat. Please recharge your wallet.', 402, {
                    balance: wallet.balance,
                    requiredPerMessage: walletService.getRates().chatPerMessage,
                    currency: wallet.currency
                });
            }

            const message = await matchService.sendMessage(matchId, userId, text.trim());

            // Deduct wallet balance for chat
            const otherUserId = message.senderId === userId ? message.matchId : message.senderId;
            try {
                await walletService.deductForChat(userId, otherUserId);
            } catch (deductErr) {
                // Message already sent, log deduction failure
                console.error('Wallet deduction failed for chat:', deductErr.message);
            }

            return apiResponse.success(res, 'Message sent successfully', message, 201);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // GET /api/matches/:matchId/messages
    async getMessages(req, res) {
        try {
            const userId = req.user.id;
            const matchId = parseInt(req.params.matchId);
            const messages = await matchService.getMessages(matchId, userId);
            return apiResponse.success(res, 'Messages retrieved successfully', messages);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // PATCH /api/matches/:matchId/status
    async updateStatus(req, res) {
        try {
            const userId = req.user.id;
            const matchId = parseInt(req.params.matchId);
            const { status } = req.body;

            if (!status) {
                return apiResponse.error(res, 'Status is required', 400);
            }

            const match = await matchService.updateMatchStatus(matchId, userId, status);
            return apiResponse.success(res, 'Match status updated successfully', match);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // DELETE /api/matches/:matchId/unmatch
    async unmatch(req, res) {
        try {
            const userId = req.user.id;
            const matchId = parseInt(req.params.matchId);
            const result = await matchService.unmatch(matchId, userId);
            return apiResponse.success(res, result.message);
        } catch (error) {
            return apiResponse.error(res, error.message, 400);
        }
    }

    // GET /api/matches/blocked
    async getBlockedUsers(req, res) {
        try {
            const userId = req.user.id;
            const blockedUsers = await matchService.getBlockedUsers(userId);
            return apiResponse.success(res, 'Blocked users retrieved', { total: blockedUsers.length, blockedUsers });
        } catch (error) {
            return apiResponse.error(res, error.message);
        }
    }
}

module.exports = new MatchController();
