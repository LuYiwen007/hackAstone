import { useState } from 'react';
import { UserProfileCard, SettingSection, SettingItem } from '../../components/settings';
import { Button } from '../../shared/ui/Button';
import './SettingsPage.css';

// 模拟用户数据
const mockUser = {
  name: '学习者',
  email: 'learner@example.com',
  streakDays: 7,
  completedTasks: 24,
  joinDate: '2026-01-01',
};

export const SettingsPage = () => {
  const [notifications, setNotifications] = useState({
    taskReminder: true,
    planUpdate: true,
    dailySummary: false,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
  });

  const handleNotificationChange = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditProfile = () => {
    // TODO: 打开编辑资料对话框
    console.log('编辑资料');
  };

  const handleLogout = () => {
    // TODO: 实现退出登录逻辑
    console.log('退出登录');
  };

  return (
    <div className="settings-page">
      <div className="settings-page-container">
        <div className="settings-page-header">
          <h1 className="settings-page-title">设置</h1>
          <p className="settings-page-description">管理你的账户和应用偏好</p>
        </div>

        <UserProfileCard user={mockUser} onEdit={handleEditProfile} />

        <SettingSection title="个人资料" icon>
          <SettingItem label="用户名" value={mockUser.name} />
          <SettingItem label="邮箱" value={mockUser.email} />
          <SettingItem label="加入时间" value={mockUser.joinDate} />
        </SettingSection>

        <SettingSection title="通知设置" icon>
          <SettingItem
            type="toggle"
            label="任务提醒"
            checked={notifications.taskReminder}
            onChange={(checked) => handleNotificationChange('taskReminder', checked)}
          />
          <SettingItem
            type="toggle"
            label="计划更新"
            checked={notifications.planUpdate}
            onChange={(checked) => handleNotificationChange('planUpdate', checked)}
          />
          <SettingItem
            type="toggle"
            label="每日总结"
            checked={notifications.dailySummary}
            onChange={(checked) => handleNotificationChange('dailySummary', checked)}
          />
        </SettingSection>

        <SettingSection title="偏好设置" icon>
          <SettingItem
            type="toggle"
            label="深色模式"
            checked={preferences.darkMode}
            onChange={(checked) => handlePreferenceChange('darkMode', checked)}
          />
          <SettingItem
            type="select"
            label="语言"
            value={preferences.language}
            onChange={(value) => handlePreferenceChange('language', value)}
            options={[
              { value: 'zh-CN', label: '简体中文' },
              { value: 'zh-TW', label: '繁体中文' },
              { value: 'en-US', label: 'English' },
            ]}
          />
          <SettingItem
            type="select"
            label="时区"
            value={preferences.timezone}
            onChange={(value) => handlePreferenceChange('timezone', value)}
            options={[
              { value: 'Asia/Shanghai', label: 'UTC+8 (北京时间)' },
              { value: 'Asia/Tokyo', label: 'UTC+9 (东京时间)' },
              { value: 'America/New_York', label: 'UTC-5 (纽约时间)' },
            ]}
          />
        </SettingSection>

        <SettingSection>
          <SettingItem
            type="link"
            label="数据管理"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H17V17H3V3Z" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M7 1V5M13 1V5" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
            showArrow
            onClick={() => console.log('数据管理')}
          />
          <SettingItem
            type="link"
            label="隐私与安全"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L3 5V10C3 14 10 18 10 18C10 18 17 14 17 10V5L10 2Z" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            showArrow
            onClick={() => console.log('隐私与安全')}
          />
          <SettingItem
            type="link"
            label="帮助与反馈"
            icon={
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="8" stroke="#4A5565" strokeWidth="1.5"/>
                <path d="M10 6V10M10 14H10.01" stroke="#4A5565" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
            showArrow
            onClick={() => console.log('帮助与反馈')}
          />
        </SettingSection>

        <Button
          variant="danger"
          size="medium"
          onClick={handleLogout}
          className="settings-page-logout-btn"
        >
          退出登录
        </Button>
      </div>
    </div>
  );
};

