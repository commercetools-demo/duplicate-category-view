import {
    ConfirmationDialog,
    useModalState,
} from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useCart } from '../../hooks/use-cart-connector';
import messages from './messages';

const DeleteCart = ({ onClose, customerId, selectedCarts }) => {
  const intl = useIntl();
  const confirmationModalState = useModalState();
  const { removeCarts } = useCart({ customerId });

  const handleConfirm = useCallback(async () => {
    await removeCarts(selectedCarts);
    handleClose();
  }, []);

  const handleClose = () => {
    confirmationModalState.closeModal();
    onClose();
  };

  useEffect(() => {
    confirmationModalState.openModal();
    return handleClose;
  }, []);

  return (
    <ConfirmationDialog
      title="Confirm channel deletion"
      isOpen={confirmationModalState.isModalOpen}
      onClose={confirmationModalState.closeModal}
      onCancel={confirmationModalState.closeModal}
      onConfirm={handleConfirm}
    >
      <Spacings.Stack scale="m">
        <Text.Body>
          {intl.formatMessage(messages.title, {
            number: selectedCarts.length,
          })}
        </Text.Body>
      </Spacings.Stack>
    </ConfirmationDialog>
  );
};

DeleteCart.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedCarts: PropTypes.array.isRequired,
  customerId: PropTypes.string.isRequired,
};

export default DeleteCart;
