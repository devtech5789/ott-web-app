import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './SubscriptionRenewed.module.scss';

import Button from '#components/Button/Button';
import { formatLocalizedDate, formatPrice } from '#src/utils/formatting';
import type { Subscription } from '#types/subscription';
import type { Customer } from '#types/account';

type Props = {
  customer: Customer;
  subscription: Subscription;
  onClose: () => void;
};

const SubscriptionRenewed: React.FC<Props> = ({ onClose, customer, subscription }: Props) => {
  const { t, i18n } = useTranslation('account');
  const date = formatLocalizedDate(new Date(subscription.expiresAt * 1000), i18n.language);
  const price = formatPrice(subscription.nextPaymentPrice, subscription.nextPaymentCurrency, customer.country);

  return (
    <div>
      <h2 className={styles.title}>{t('subscription_renewed.title')}</h2>
      <p className={styles.paragraph}>{t('subscription_renewed.message', { date, price })}</p>
      <Button label={t('subscription_renewed.back_to_profile')} onClick={onClose} fullWidth />
    </div>
  );
};

export default SubscriptionRenewed;
