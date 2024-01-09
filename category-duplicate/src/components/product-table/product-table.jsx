import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import DataTable, { useRowSelection } from '@commercetools-uikit/data-table';

import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { useDataTableSortingState } from '@commercetools-uikit/hooks';
import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import Stamp from '@commercetools-uikit/stamp';
import Text from '@commercetools-uikit/text';
import { useIntl } from 'react-intl';
import messages from './messages';

const initialVisibleColumns = [
  { key: 'productName', label: 'Product name' },
  { key: 'categories', label: 'Categories' },
  { key: 'productType', label: 'Product type' },
  { key: 'status', label: 'Status' },
  { key: 'variants', label: 'Variants' },
];

const initialHiddenColumns = [{ key: 'sku', label: 'SKU' }];

const initialColumnsState = [...initialVisibleColumns, ...initialHiddenColumns];

const ProductTable = ({ items }) => {
  const intl = useIntl();

  const tableSorting = useDataTableSortingState({ key: 'sku', order: 'asc' });

  const [tableData, setTableData] = useState({
    columns: initialColumnsState,
    visibleColumnKeys: initialVisibleColumns.map(({ key }) => key),
  });

  const [isCondensed, setIsCondensed] = useState(true);
  const [isWrappingText, setIsWrappingText] = useState(false);
  const {
    rows: rowsWithSelection,
    toggleRow,
    selectAllRows,
    deselectAllRows,
    getIsRowSelected,
    getNumberOfSelectedRows,
  } = useRowSelection('checkbox', items);

  const dataLocale = useApplicationContext((context) => context.dataLocale);
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );

  const countSelectedRows = getNumberOfSelectedRows();
  const isSelectColumnHeaderIndeterminate =
    countSelectedRows > 0 && countSelectedRows < rowsWithSelection.length;
  const handleSelectColumnHeaderChange =
    countSelectedRows === 0 ? selectAllRows : deselectAllRows;

  const mappedColumns = tableData.columns.reduce(
    (columns, column) => ({
      ...columns,
      [column.key]: column,
    }),
    {}
  );
  const visibleColumns = tableData.visibleColumnKeys.map(
    (columnKey) => mappedColumns[columnKey]
  );

  const columnsWithSelect = [
    {
      key: 'checkbox',
      label: (
        <CheckboxInput
          isIndeterminate={isSelectColumnHeaderIndeterminate}
          isChecked={countSelectedRows !== 0}
          isDisabled
          onChange={handleSelectColumnHeaderChange}
        />
      ),
      shouldIgnoreRowClick: true,
      align: 'center',
      renderItem: (row) => (
        <CheckboxInput
          isChecked={getIsRowSelected(row.id)}
          isDisabled
          onChange={() => toggleRow(row.id)}
        />
      ),
      disableResizing: true,
    },
    ...visibleColumns,
  ];
  const onSettingChange = (action, nextValue) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              columns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
      default:
        break;
    }
  };

  const displaySettings = {
    disableDisplaySettings: false,
    isCondensed,
    isWrappingText,
  };

  const columnManager = {
    areHiddenColumnsSearchable: true,
    disableColumnManager: false,
    visibleColumnKeys: tableData.visibleColumnKeys,
    hideableColumns: tableData.columns,
  };

  useEffect(() => {
    selectAllRows();
  }, [items]);
  return (
    <DataTableManager
      columns={columnsWithSelect}
      onSettingsChange={onSettingChange}
      columnManager={columnManager}
      displaySettings={displaySettings}
      topBar={
        <Text.Body>{`${intl.formatMessage(messages.products)}: ${
          items.length
        }`}</Text.Body>
      }
    >
      <DataTable
        isCondensed
        rows={rowsWithSelection}
        columns={columnsWithSelect}
        itemRenderer={(item, column) => {
          switch (column.key) {
            case 'productName':
              return formatLocalizedString(
                {
                  productName: transformLocalizedFieldToLocalizedString(
                    item.masterData?.current?.nameAllLocales ?? []
                  ),
                },
                {
                  key: 'productName',
                  locale: dataLocale,
                  fallbackOrder: projectLanguages,
                  fallback: NO_VALUE_FALLBACK,
                }
              );
            case 'categories':
              return item.masterData?.current?.categories?.length;
            case 'variants':
              return item.masterData?.current?.allVariants?.length;
            case 'sku':
              return item.masterData?.current?.allVariants?.[0]?.sku;
            case 'productType':
              return item.productType?.name;
            case 'status': {
              if (
                item.masterData?.published &&
                !item.masterData?.hasStagedChanges
              ) {
                return <Stamp tone="primary">Published</Stamp>;
              }
              if (
                item.masterData?.published &&
                item.masterData?.hasStagedChanges
              ) {
                return <Stamp tone="secondary">Modified</Stamp>;
              }
              return <Stamp tone="critical">Unpublished</Stamp>;
            }

            default:
              return null;
          }
        }}
        sortedBy={tableSorting.value.key}
        sortDirection={tableSorting.value.order}
        onSortChange={tableSorting.onChange}
      />
    </DataTableManager>
  );
};

ProductTable.propTypes = {
  items: PropTypes.array.isRequired,
};

export default ProductTable;
