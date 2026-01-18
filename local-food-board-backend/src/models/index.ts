import User from './User';
import Post from './Post';
import Report from './Report';
import Notification from './Notification';


// Связи User <-> Post
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Связи User <-> Report (кто пожаловался)
User.hasMany(Report, { foreignKey: 'reporterId', as: 'myReports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

// Связи User <-> Report (на кого пожаловались)
User.hasMany(Report, { foreignKey: 'reportedUserId', as: 'reportsAgainstMe' });
Report.belongsTo(User, { foreignKey: 'reportedUserId', as: 'reportedUser' });

// Связи Post <-> Report (жалоба на пост)
Post.hasMany(Report, { foreignKey: 'postId', as: 'reports' });
Report.belongsTo(Post, { foreignKey: 'postId', as: 'post' });



//  Связи User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

//  Связи Post <-> Notification
Post.hasMany(Notification, { foreignKey: 'postId', as: 'notifications' });
Notification.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

export { User, Post, Report, Notification };



