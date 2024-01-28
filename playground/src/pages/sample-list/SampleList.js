import React, { useEffect, useMemo, useState, useCallback } from 'react';

import {
  useAuthenticationContext,
  useFiProxy,
  useFormManagerContext,
  useSnackbar,
  useTranslation,
  useLocalization,
  scopeKeys,
  stringFormat,
} from 'component/base';
import { Card, DataGrid, Filter, Input, BasePage, withFormPage } from 'component/ui';

import SampleDefinition from '../sample-definition';
import { apiUrls } from '../../constants';

/**
 * UI unique identifier meta-data.
 */
const uiMetadata = {
  moduleName: 'playground',
  uiKey: 'u24bddfade6',
};

const SampleList = (props) => {
  const { enqueueSnackbar, enqueueSuccess } = useSnackbar();
  const { tenant } = useAuthenticationContext();
  const { showDialog } = useFormManagerContext();
  const [dataSource, setDataSource] = useState([]);
  const { formatDateTime } = useLocalization();
  const { translate, translateByFieldName } = useTranslation();

  const { executeGet, executeDelete } = useFiProxy();

  useEffect(() => {
    getDataSource();
  }, []);

  const getDataSource = (data) => {
    if (data?._id) {
      executeGet({
        fullURL: stringFormat(apiUrls.TicketTicketsById, data._id),
        enqueueSnackbarOnError: false,
      }).then((response) => {
        if (response.success) {
          const updatedObject = {
            ...response.data,
            status: translate(response.data.status),
            createdAt: formatDateTime(response.data.createdAt),
            updatedAt: formatDateTime(response.data.updatedAt),
          };
          setDataSource([updatedObject]);
        } else {
          enqueueSuccess(translate('Error occurred while fetching ticket'));
        }
      });
    } else {
      executeGet({
        fullURL: apiUrls.TicketTickets,
        enqueueSnackbarOnError: false,
      }).then((response) => {
        if (response.success) {
          const updatedData = response.data.map((item) => ({
            ...item,
            status: translate(item.status),
            createdAt: formatDateTime(item.createdAt),
            updatedAt: formatDateTime(item.updatedAt),
          }));
          setDataSource(updatedData);
        } else {
          enqueueSuccess(translate('Error occurred while fetching tickets'));
        }
      });
    }
  };

  const deleteData = (id) => {
    if (id) {
      executeDelete({ fullURL: stringFormat(apiUrls.TicketTicketsById, id), enqueueSnackbarOnError: false }).then(
        (response) => {
          if (response.success) {
            getDataSource();
            enqueueSuccess(translate('The ticket successfully deleted'));
          }
        },
      );
    }
  };

  const columns = useMemo(() => {
    return [
      { name: '_id', header: translate('Id'), visible: false },
      { name: 'name', header: translate('Name'), defaultFlex: 1 },
      { name: 'status', header: translate('Status'), defaultFlex: 1 },
      { name: 'createdAt', header: translate('Creation date'), defaultFlex: 1 },
      { name: 'updatedAt', header: translate('Updated date'), defaultFlex: 1 },
      { name: 'definition', header: translate('Reason for ticket'), defaultFlex: 2 },
    ];
  }, []);

  const onActionClick = (action) => {};

  const addClicked = useCallback(() => {
    showDialog({
      title: translate('Sample add'),
      content: <SampleDefinition />,
      callback: (data) => {
        if (data) {
          getDataSource();
          navigator.clipboard.writeText(data._id);
          enqueueSuccess(translate('New ticket created successfully, Copied the ticket no:') + data._id);
        }
      },
    });
  }, []);

  const editClicked = useCallback((id, data) => {
    data &&
      showDialog({
        title: translate('Sample edit'),
        content: <SampleDefinition Id={data._id} />,
        callback: () => {
          getDataSource();
          enqueueSuccess(translate('The ticket was successfully updated'));
        },
      });
  }, []);

  const deleteClicked = useCallback((id, data) => {
    data && deleteData(data._id);
  }, []);

  const gridActionList = useMemo(
    () => [
      {
        name: 'delete',
        onClick: deleteClicked,
        scopeKey: scopeKeys.Create_Loan,
      },
      {
        name: 'edit',
        onClick: editClicked,
        scopeKey: scopeKeys.Create_Loan,
      },
    ],
    [deleteClicked, editClicked],
  );

  const cardActionList = useMemo(
    () => [
      {
        name: 'Add',
        icon: 'add',
        onClick: addClicked,
        scopeKey: scopeKeys.Create_Loan,
      },
    ],
    [addClicked],
  );

  return (
    <BasePage {...props} onActionClick={onActionClick}>
      <Filter onFilter={(data) => getDataSource(data)}>
        <Input name={'_id'} label={translate('Ticket No')} primaryFilter />
      </Filter>
      <Card scopeKey={scopeKeys.View_Loan} showHeader={true} actionList={cardActionList}>
        <DataGrid
          dataSource={dataSource}
          columns={columns}
          actionList={gridActionList}
          autoSizeAllColumns
          idProperty="id"
        />
      </Card>
    </BasePage>
  );
};
SampleList.displayName = 'SampleList';

export default withFormPage(SampleList, { uiMetadata });
