import {
    useApplicationContext,
    useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { getErrorMessage } from '../../helpers';
import { useCart } from '../../hooks/use-cart-connector';
import Cart from '../cart';
import CartsTable from '../carts-table';
import DeleteCart from '../delete-cart';
import messages from './messages';

const Carts = () => {
  const intl = useIntl();

  const [isDeleteCartOpen, setIsDeleteCartOpen] = useState(false);
  const [isCartViewOpen, setIsCartViewOpen] = useState(false)
  const [selectedCarts, setSelectedCarts] = useState([]);

  const { env, testURL } = useApplicationContext(
    (context) => context.environment
  );

  const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const currentUrl = env === 'development' ? testURL : hostUrl;

  const [_, customerId] = currentUrl.match(
    '/customers/([^/]+)/.*'
  );

  const { carts, error, loading } = useCart({
    customerId
  });

  const handleOpenCart = (cart) => {
    setSelectedCarts([cart]);
    setIsCartViewOpen(true);
  }

  if (error || !customerId) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!loading && !carts?.length) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="s">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {!!carts ? (
        <Spacings.Stack scale="l" alignItems="stretch">
          <Spacings.Inline
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Spacings.Stack scale="s" alignItems="stretch">
              <SelectField
                title="Actions"
                value="null"
                isDisabled={selectedCarts.length === 0}
                options={[
                  { value: 'delete', label: 'Delete' },
                ]}
                onChange={() => setIsDeleteCartOpen(true)}
              />
            </Spacings.Stack>

          </Spacings.Inline>

          {carts.length > 0 && (
            <CartsTable
              items={carts}
              onSelectionChange={setSelectedCarts}
              onOpenCart={handleOpenCart}
            />
          )}
        </Spacings.Stack>
      ) : (
        <Spacings.Stack scale="s">
          <Text.Headline intlMessage={messages.noResults} />
        </Spacings.Stack>
      )}
     
      {isCartViewOpen && (
        <Cart
          onClose={() => setIsCartViewOpen(false)}
          customerId={customerId}
          cart={selectedCarts[0]}
        />
      )}
     
      {isDeleteCartOpen && (
        <DeleteCart
          onClose={() => setIsDeleteCartOpen(false)}
          customerId={customerId}
          selectedCarts={selectedCarts}
        />
      )}
    </Spacings.Stack>
  );
};
Carts.displayName = 'Carts';

export default Carts;
