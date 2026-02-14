import { Button } from '../../../../shared/ui/Button';
import './UserProfileCard.css';

export const UserProfileCard = ({ user, onEdit }) => {
  return (
    <div className="user-profile-card">
      <div className="user-profile-card-content">
        <div className="user-profile-card-info">
          <h2 className="user-profile-card-name">{user.name || '学习者'}</h2>
          <p className="user-profile-card-email">{user.email || 'learner@example.com'}</p>
          <div className="user-profile-card-stats">
            <span>连续学习 {user.streakDays || 7} 天</span>
            <span>•</span>
            <span>完成 {user.completedTasks || 24} 个任务</span>
          </div>
        </div>
        <div className="user-profile-card-avatar">
          <div className="user-profile-card-avatar-circle">
            {user.avatar || user.name?.[0] || 'U'}
          </div>
        </div>
        <button
          className="user-profile-card-edit-btn"
          onClick={onEdit}
        >
          编辑资料
        </button>
      </div>
    </div>
  );
};

