import {
    InfoModalPage,
    useModalState,
} from '@commercetools-frontend/application-components';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import messages from './messages';

const Cart = ({ onClose, cart }) => {
  const intl = useIntl();

  const formModalState = useModalState();

  const handleClose = () => {
    formModalState.closeModal();
    onClose();
  };

  useEffect(() => {
    formModalState.openModal();
    return handleClose;
  }, []);

  return (
    <InfoModalPage
      title={intl.formatMessage(messages.title)}
      subtitle={cart.id}
      topBarPreviousPathLabel={intl.formatMessage(messages.previous)}
      isOpen={formModalState.isModalOpen}
      onClose={handleClose}
      level={2}
      baseZIndex={10}
    >
      <pre>{JSON.stringify(cart, null, 4)}</pre>
    </InfoModalPage>
  );
};

Cart.propTypes = {
  onClose: PropTypes.func.isRequired,
  cart: PropTypes.object.isRequired,
};

export default Cart;
