const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Create a new group
router.post('/', async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = new Group({
            name: name.trim(),
            creator: req.userId,
            members: [req.userId],
            admins: [req.userId]
        });

        await group.save();

        // Add group to user's groups
        await User.findByIdAndUpdate(req.userId, {
            $push: { groups: group._id }
        });

        res.status(201).json({
            message: 'Group created successfully',
            group: {
                id: group._id,
                name: group.name,
                inviteCode: group.inviteCode,
                isAdmin: true,
                isCreator: true
            }
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ error: 'Server error creating group' });
    }
});

// Join a group via invite code
router.post('/join', async (req, res) => {
    try {
        const { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ error: 'Invite code is required' });
        }

        const group = await Group.findOne({ inviteCode: inviteCode.toUpperCase() });
        if (!group) {
            return res.status(404).json({ error: 'Invalid invite code' });
        }

        // Check if already a member
        if (group.members.includes(req.userId)) {
            return res.status(400).json({ error: 'You are already a member of this group' });
        }

        // Add user to group
        group.members.push(req.userId);
        await group.save();

        // Add group to user's groups
        await User.findByIdAndUpdate(req.userId, {
            $push: { groups: group._id }
        });

        res.json({
            message: 'Joined group successfully',
            group: {
                id: group._id,
                name: group.name,
                inviteCode: group.inviteCode
            }
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ error: 'Server error joining group' });
    }
});

// Get user's groups
router.get('/', async (req, res) => {
    try {
        const groups = await Group.find({ members: req.userId })
            .select('name inviteCode creator admins members')
            .populate('members', 'username');

        const groupsWithRole = groups.map(group => ({
            id: group._id,
            name: group.name,
            inviteCode: group.inviteCode,
            memberCount: group.members.length,
            isAdmin: group.admins.some(admin => admin.toString() === req.userId),
            isCreator: group.creator.toString() === req.userId
        }));

        res.json({ groups: groupsWithRole });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ error: 'Server error fetching groups' });
    }
});

// Get single group details with members
router.get('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'username')
            .populate('admins', 'username')
            .populate('creator', 'username');

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is a member
        const isMember = group.members.some(m => m._id.toString() === req.userId);
        if (!isMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        res.json({
            group: {
                id: group._id,
                name: group.name,
                inviteCode: group.inviteCode,
                creator: group.creator,
                members: group.members.map(m => ({
                    id: m._id,
                    username: m.username,
                    isAdmin: group.admins.some(a => a._id.toString() === m._id.toString()),
                    isCreator: group.creator._id.toString() === m._id.toString()
                })),
                isAdmin: group.admins.some(a => a._id.toString() === req.userId),
                isCreator: group.creator._id.toString() === req.userId
            }
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ error: 'Server error fetching group' });
    }
});

// Delete group (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if user is admin
        const isAdmin = group.admins.some(admin => admin.toString() === req.userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can delete the group' });
        }

        // Delete all messages in the group
        await Message.deleteMany({ groupId: group._id });

        // Remove group from all users
        await User.updateMany(
            { groups: group._id },
            { $pull: { groups: group._id } }
        );

        // Delete the group
        await Group.findByIdAndDelete(group._id);

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({ error: 'Server error deleting group' });
    }
});

// Promote member to admin
router.post('/:id/promote', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if requester is admin
        const isAdmin = group.admins.some(admin => admin.toString() === req.userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can promote members' });
        }

        // Check if target is a member
        const isMember = group.members.some(m => m.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ error: 'User is not a member of this group' });
        }

        // Check if already admin
        const isAlreadyAdmin = group.admins.some(a => a.toString() === userId);
        if (isAlreadyAdmin) {
            return res.status(400).json({ error: 'User is already an admin' });
        }

        // Promote to admin
        group.admins.push(userId);
        await group.save();

        res.json({ message: 'Member promoted to admin successfully' });
    } catch (error) {
        console.error('Promote admin error:', error);
        res.status(500).json({ error: 'Server error promoting member' });
    }
});

// Demote admin (remove admin rights)
router.post('/:id/demote', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if requester is admin
        const isAdmin = group.admins.some(admin => admin.toString() === req.userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can demote other admins' });
        }

        // Cannot demote the creator
        if (group.creator.toString() === userId) {
            return res.status(400).json({ error: 'Cannot demote the group creator' });
        }

        // Check if target is an admin
        const isTargetAdmin = group.admins.some(a => a.toString() === userId);
        if (!isTargetAdmin) {
            return res.status(400).json({ error: 'User is not an admin' });
        }

        // Remove from admins
        group.admins = group.admins.filter(a => a.toString() !== userId);
        await group.save();

        res.json({ message: 'Admin rights removed successfully' });
    } catch (error) {
        console.error('Demote admin error:', error);
        res.status(500).json({ error: 'Server error demoting admin' });
    }
});

// Remove member from group
router.post('/:id/remove-member', async (req, res) => {
    try {
        const { userId } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if requester is admin
        const isAdmin = group.admins.some(admin => admin.toString() === req.userId);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can remove members' });
        }

        // Cannot remove the creator
        if (group.creator.toString() === userId) {
            return res.status(400).json({ error: 'Cannot remove the group creator' });
        }

        // Check if target is a member
        const isMember = group.members.some(m => m.toString() === userId);
        if (!isMember) {
            return res.status(400).json({ error: 'User is not a member of this group' });
        }

        // Remove from members and admins
        group.members = group.members.filter(m => m.toString() !== userId);
        group.admins = group.admins.filter(a => a.toString() !== userId);
        await group.save();

        // Remove group from user's groups
        await User.findByIdAndUpdate(userId, {
            $pull: { groups: group._id }
        });

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ error: 'Server error removing member' });
    }
});

// Leave group
router.post('/:id/leave', async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Creator cannot leave
        if (group.creator.toString() === req.userId) {
            return res.status(400).json({ error: 'Creator cannot leave the group. Delete it instead.' });
        }

        // Remove from members and admins
        group.members = group.members.filter(m => m.toString() !== req.userId);
        group.admins = group.admins.filter(a => a.toString() !== req.userId);
        await group.save();

        // Remove group from user's groups
        await User.findByIdAndUpdate(req.userId, {
            $pull: { groups: group._id }
        });

        res.json({ message: 'Left group successfully' });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ error: 'Server error leaving group' });
    }
});

module.exports = router;
