import User from './User';
import Post from './Post';
import Report from './Report';
import PasswordReset from './PasswordReset';

// Связи User <-> Post
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Связи User <-> Report (кто пожаловался)
User.hasMany(Report, { foreignKey: 'reporterId', as: 'myReports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// Связи User <-> Report (на кого пожаловались)
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsAgainstMe' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });

// Связи Post <-> Report
Post.hasMany(Report, { foreignKey: 'postId', as: 'reports' });
Report.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Связи User <-> PasswordReset
User.hasMany(PasswordReset, { foreignKey: 'userId' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Post, Report, PasswordReset };