const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Send anonymous message
router.post('/', async (req, res) => {
    try {
        const { receiverId, groupId, messageText } = req.body;

        // Validation
        if (!receiverId || !groupId || !messageText) {
            return res.status(400).json({ error: 'Receiver, group, and message are required' });
        }

        if (messageText.trim().length === 0) {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        if (messageText.length > 1000) {
            return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
        }

        // Verify sender is in the group
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const isSenderMember = group.members.some(m => m.toString() === req.userId);
        if (!isSenderMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Verify receiver is in the group
        const isReceiverMember = group.members.some(m => m.toString() === receiverId);
        if (!isReceiverMember) {
            return res.status(400).json({ error: 'Receiver is not a member of this group' });
        }

        // Cannot send message to yourself
        if (receiverId === req.userId) {
            return res.status(400).json({ error: 'Cannot send message to yourself' });
        }

        // Create message - NOTE: No senderId stored for anonymity
        const message = new Message({
            receiverId,
            groupId,
            messageText: messageText.trim()
            // senderId is intentionally NOT stored
        });

        await message.save();

        res.status(201).json({
            message: 'Message sent anonymously',
            messageId: message._id
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Server error sending message' });
    }
});

// Get user's inbox
router.get('/inbox', async (req, res) => {
    try {
        const messages = await Message.find({ receiverId: req.userId })
            .populate('groupId', 'name inviteCode')
            .sort({ createdAt: -1 })
            .limit(100);

        const formattedMessages = messages.map(msg => ({
            id: msg._id,
            messageText: msg.messageText,
            groupName: msg.groupId?.name || 'Unknown Group',
            groupInviteCode: msg.groupId?.inviteCode || '',
            createdAt: msg.createdAt
            // No sender information - completely anonymous
        }));

        res.json({ messages: formattedMessages });
    } catch (error) {
        console.error('Get inbox error:', error);
        res.status(500).json({ error: 'Server error fetching inbox' });
    }
});

// Delete a message (receiver can delete from their inbox)
router.delete('/:id', async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Only receiver can delete
        if (message.receiverId.toString() !== req.userId) {
            return res.status(403).json({ error: 'You can only delete your own messages' });
        }

        await Message.findByIdAndDelete(message._id);

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ error: 'Server error deleting message' });
    }
});

module.exports = router;
