import { Segmented } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Severity } from '../../../types/realtime-logs.types';

type SeverityOption = Severity | 'all';

interface SeverityFilterProps {
  value: SeverityOption;
  onChange: (value: SeverityOption) => void;
}

export const SeverityFilter = ({ value, onChange }: SeverityFilterProps) => {
  const { t } = useTranslation('realtime-logs');
  const options = [
    { label: t('severity.all'), value: 'all' as const },
    { label: t('severity.info'), value: 'i' as const },
    { label: t('severity.warning'), value: 'w' as const },
    { label: t('severity.error'), value: 'e' as const },
    { label: t('severity.critical'), value: 'c' as const },
  ];
  return (
    <Segmented
      value={value}
      onChange={(v) => onChange(v as SeverityOption)}
      options={options}
    />
  );
};

export type { SeverityOption };
