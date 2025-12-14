import { Tag, Space } from 'antd';
import {
  KeyOutlined,
  UserSwitchOutlined,
  MessageOutlined,
  TeamOutlined,
  NotificationOutlined,
  AppstoreOutlined,
  FileImageOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { EventCategory } from '../../../types/realtime-logs.types';

interface CategoryFiltersProps {
  selected: EventCategory[];
  onChange: (categories: EventCategory[]) => void;
}

const CATEGORY_ICONS: Record<EventCategory, React.ReactNode> = {
  [EventCategory.AUTH]: <KeyOutlined />,
  [EventCategory.PRESENCE]: <UserSwitchOutlined />,
  [EventCategory.MESSAGE]: <MessageOutlined />,
  [EventCategory.GROUP]: <TeamOutlined />,
  [EventCategory.BROADCAST]: <NotificationOutlined />,
  [EventCategory.CHANNEL]: <AppstoreOutlined />,
  [EventCategory.STORY]: <FileImageOutlined />,
  [EventCategory.CALL]: <PhoneOutlined />,
  [EventCategory.PROFILE]: <IdcardOutlined />,
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
  [EventCategory.AUTH]: '#1890ff',
  [EventCategory.PRESENCE]: '#52c41a',
  [EventCategory.MESSAGE]: '#722ed1',
  [EventCategory.GROUP]: '#fa8c16',
  [EventCategory.BROADCAST]: '#eb2f96',
  [EventCategory.CHANNEL]: '#13c2c2',
  [EventCategory.STORY]: '#faad14',
  [EventCategory.CALL]: '#f5222d',
  [EventCategory.PROFILE]: '#2f54eb',
};

const CATEGORY_KEYS: Record<EventCategory, string> = {
  [EventCategory.AUTH]: 'auth',
  [EventCategory.PRESENCE]: 'presence',
  [EventCategory.MESSAGE]: 'message',
  [EventCategory.GROUP]: 'group',
  [EventCategory.BROADCAST]: 'broadcast',
  [EventCategory.CHANNEL]: 'channel',
  [EventCategory.STORY]: 'story',
  [EventCategory.CALL]: 'call',
  [EventCategory.PROFILE]: 'profile',
};

const ALL_CATEGORIES = Object.values(EventCategory).filter(
  (v) => typeof v === 'number'
) as EventCategory[];

export const CategoryFilters = ({ selected, onChange }: CategoryFiltersProps) => {
  const { t } = useTranslation('realtime-logs');
  const isAllSelected = selected.length === 0;
  const handleToggle = (category: EventCategory) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };
  const handleSelectAll = () => {
    onChange([]);
  };
  const getCategoryConfig = (cat: EventCategory) => ({
    label: t(`categories.${CATEGORY_KEYS[cat]}`),
    color: CATEGORY_COLORS[cat],
    icon: CATEGORY_ICONS[cat],
  });
  return (
    <Space size={[0, 8]} wrap>
      <Tag
        color={isAllSelected ? 'blue' : undefined}
        style={{ cursor: 'pointer', marginRight: 8 }}
        onClick={handleSelectAll}
      >
        {t('categories.all')}
      </Tag>
      {ALL_CATEGORIES.map((cat) => {
        const config = getCategoryConfig(cat);
        const isSelected = selected.includes(cat);
        return (
          <Tag
            key={cat}
            color={isSelected ? config.color : undefined}
            icon={config.icon}
            style={{
              cursor: 'pointer',
              opacity: isAllSelected || isSelected ? 1 : 0.5,
            }}
            onClick={() => handleToggle(cat)}
          >
            {config.label}
          </Tag>
        );
      })}
    </Space>
  );
};

export { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_KEYS };
