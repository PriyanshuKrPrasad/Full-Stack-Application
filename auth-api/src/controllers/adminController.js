'use strict';
const prisma = require('../lib/prisma');

// ── GET /api/admin/stats ───────────────────────────────────────
// Returns total users, new users today/week, role breakdown
const getStats = async (req, res, next) => {
  try {
    const now       = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart  = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      adminCount,
      userCount,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          newToday,
          newThisWeek,
          newThisMonth,
          adminCount,
          userCount,
        },
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/admin/users ───────────────────────────────────────
// Returns paginated list of all users
const getAllUsers = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, parseInt(req.query.limit) || 10);
    const skip     = (page - 1) * limit;
    const search   = req.query.search?.trim() || '';
    const roleFilter = req.query.role || '';

    const where = {
      ...(search ? {
        OR: [
          { name:  { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id:        true,
          name:      true,
          email:     true,
          role:      true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/admin/users/:id/role ───────────────────────────
// Change a user's role (ADMIN only)
const changeUserRole = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'USER' or 'ADMIN'." });
    }

    // Prevent demoting yourself
    if (userId === req.user.id && role === 'USER') {
      return res.status(400).json({ success: false, message: 'You cannot demote yourself.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data:  { role },
      select: { id: true, name: true, email: true, role: true, updatedAt: true },
    });

    res.status(200).json({ success: true, data: { user: updated } });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/admin/users/:id ────────────────────────────────
// Delete a user (cannot delete yourself)
const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account this way.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await prisma.user.delete({ where: { id: userId } });

    res.status(200).json({ success: true, message: `User "${user.name}" deleted successfully.` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getAllUsers, changeUserRole, deleteUser };
