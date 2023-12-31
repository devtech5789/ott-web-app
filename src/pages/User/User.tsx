import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import shallow from 'zustand/shallow';

import styles from './User.module.scss';

import AccountComponent from '#components/Account/Account';
import Button from '#components/Button/Button';
import ConfirmationDialog from '#components/ConfirmationDialog/ConfirmationDialog';
import Favorites from '#components/Favorites/Favorites';
import LoadingOverlay from '#components/LoadingOverlay/LoadingOverlay';
import PaymentContainer from '#src/containers/PaymentContainer/PaymentContainer';
import PlaylistContainer from '#src/containers/PlaylistContainer/PlaylistContainer';
import useBreakpoint, { Breakpoint } from '#src/hooks/useBreakpoint';
import AccountCircle from '#src/icons/AccountCircle';
import BalanceWallet from '#src/icons/BalanceWallet';
import Exit from '#src/icons/Exit';
import Favorite from '#src/icons/Favorite';
import { logout } from '#src/stores/AccountController';
import { useAccountStore } from '#src/stores/AccountStore';
import { getSubscriptionSwitches } from '#src/stores/CheckoutController';
import { PersonalShelf, useConfigStore } from '#src/stores/ConfigStore';
import { clear as clearFavorites } from '#src/stores/FavoritesController';
import { mediaURL } from '#src/utils/formatting';
import type { PlaylistItem } from '#types/playlist';

const User = (): JSX.Element => {
  const { accessModel, favoritesList } = useConfigStore(
    (s) => ({
      accessModel: s.accessModel,
      favoritesList: s.config.features?.favoritesList,
    }),
    shallow,
  );
  const navigate = useNavigate();
  const { t } = useTranslation('user');
  const breakpoint = useBreakpoint();
  const [clearFavoritesOpen, setClearFavoritesOpen] = useState(false);

  const isLargeScreen = breakpoint > Breakpoint.md;
  const { user: customer, subscription, loading, canUpdateEmail } = useAccountStore();

  const onCardClick = (playlistItem: PlaylistItem) => navigate(mediaURL({ media: playlistItem }));
  const onLogout = useCallback(async () => {
    // Empty customer on a user page leads to navigate (code bellow), so we don't repeat it here
    await logout();
  }, []);

  useEffect(() => {
    if (accessModel !== 'AVOD') {
      getSubscriptionSwitches();
    }
  }, [accessModel]);

  useEffect(() => {
    if (!loading && !customer) {
      navigate('/', { replace: true });
    }
  }, [navigate, customer, loading]);

  if (!customer) {
    return (
      <div className={styles.user}>
        <LoadingOverlay inline />
      </div>
    );
  }

  return (
    <div className={styles.user}>
      {isLargeScreen && (
        <div className={styles.leftColumn}>
          <div className={styles.panel}>
            <ul>
              <li>
                <Button to="my-account" label={t('nav.account')} variant="text" startIcon={<AccountCircle />} className={styles.button} />
              </li>
              {favoritesList && (
                <li>
                  <Button to="favorites" label={t('nav.favorites')} variant="text" startIcon={<Favorite />} className={styles.button} />
                </li>
              )}
              {accessModel !== 'AVOD' && (
                <li>
                  <Button to="payments" label={t('nav.payments')} variant="text" startIcon={<BalanceWallet />} className={styles.button} />
                </li>
              )}
              <li className={styles.logoutLi}>
                <Button onClick={onLogout} label={t('nav.logout')} variant="text" startIcon={<Exit />} className={styles.button} />
              </li>
            </ul>
          </div>
        </div>
      )}
      <div className={styles.mainColumn}>
        <Routes>
          <Route
            path="my-account"
            element={<AccountComponent panelClassName={styles.panel} panelHeaderClassName={styles.panelHeader} canUpdateEmail={canUpdateEmail} />}
          />
          {favoritesList && (
            <Route
              path="favorites"
              element={
                <>
                  <PlaylistContainer type={PersonalShelf.Favorites} showEmpty>
                    {({ playlist, error, isLoading }) => (
                      <Favorites
                        playlist={playlist}
                        error={error}
                        isLoading={isLoading}
                        onCardClick={onCardClick}
                        onClearFavoritesClick={() => setClearFavoritesOpen(true)}
                        accessModel={accessModel}
                        hasSubscription={!!subscription}
                      />
                    )}
                  </PlaylistContainer>
                  <ConfirmationDialog
                    open={clearFavoritesOpen}
                    title={t('favorites.clear_favorites_title')}
                    body={t('favorites.clear_favorites_body')}
                    onConfirm={async () => {
                      await clearFavorites();
                      setClearFavoritesOpen(false);
                    }}
                    onClose={() => setClearFavoritesOpen(false)}
                  />
                </>
              }
            />
          )}
          <Route path="payments" element={accessModel !== 'AVOD' ? <PaymentContainer /> : <Navigate to="my-account" />} />
          <Route path="*" element={<Navigate to="my-account" />} />
        </Routes>
      </div>
    </div>
  );
};

export default User;
