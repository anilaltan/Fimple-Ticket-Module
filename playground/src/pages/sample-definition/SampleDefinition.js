import React, { useEffect, useRef, useState, useMemo } from 'react';

import {
  useAuthenticationContext,
  useFiProxy,
  useSnackbar,
  useTranslation,
  useTransactionContext,
  scopeKeys,
  stringFormat,
} from 'component/base';
import {
  BasePage,
  Card,
  Checkbox,
  Input,
  Button,
  GetIcon,
  Select,
  SelectEnum,
  DatePicker,
  withFormPage,
  Avatar,
} from 'component/ui';

import { apiUrls } from '../../constants';

/**
 * UI unique identifier meta-data.
 */
const uiMetadata = {
  moduleName: 'playground',
  uiKey: 'u7e7c13a017',
};

const SampleDefinition = ({ close, isBpm, Id, ...rest }) => {
  const { translate } = useTranslation();
  const { tenant, user } = useAuthenticationContext();
  const { enqueueSnackbar } = useSnackbar();

  const [image, setImage] = useState();
  let reader = new FileReader();
  const [dataModel, setDataModel] = useState({});

  const ticketNoRef = useRef();
  const nameRef = useRef();
  const surnameRef = useRef();
  const ageRef = useRef();
  const tcRef = useRef();
  const definitionRef = useRef();
  const addressRef = useRef();
  const statusRef = useRef();
  const responseRef = useRef();

  const { executeGet, executePost, executePut, executePatch } = useFiProxy();

  useEffect(() => {
    Id && getSampleData(Id);
  }, []);

  const filledState = (dataContract) => {
    if (dataContract) {
      setDataModel(dataContract);
    }
  };

  const getSampleData = (Id) => {
    executeGet({ fullURL: stringFormat(apiUrls.TicketTicketsById, Id), enqueueSnackbarOnError: false }).then(
      (response) => {
        if (response.success) {
          setDataModel(response.data);
          setImage(response.data.imageText);
        }
      },
    );
  };

  const onValueChanged = (field, value) => {
    setDataModel({ ...dataModel, [field]: value });
  };

  const onActionClick = (action) => {
    if (action.commandName === 'Save') {
      if (Id) {
        executePatch({
          fullURL: stringFormat(apiUrls.TicketTicketsById, Id),
          data: {
            ...dataModel,
            name: nameRef.current.value,
            surname: surnameRef.current.value,
            age: ageRef.current.value,
            TC: tcRef.current.value,
            definition: definitionRef.current.value,
            address: addressRef.current.value,
            status: statusRef.current.value,
            response: responseRef.current.value,
          },
          enqueueSnackbarOnError: false,
        }).then((response) => {
          if (response.success) {
            close();
          } else {
            enqueueSuccess(translate('Error occured while updating ticket'));
          }
        });
      } else {
        const data = {
          ...dataModel,
          name: nameRef.current.value,
          surname: surnameRef.current.value,
          age: ageRef.current.value,
          TC: tcRef.current.value,
          definition: definitionRef.current.value,
          address: addressRef.current.value,
          image: image,
        };

        executePost({
          fullURL: apiUrls.TicketTickets,
          data: data,
          enqueueSnackbarOnError: false,
        }).then((response) => {
          if (response.success) {
            close(response.data);
          } else {
            enqueueSuccess(translate('Error occured while creating ticket'));
          }
        });
      }
    } else if (action.commandName == 'Cancel') {
      close && close(false);
    }
  };

  const handleUpload = (path, e) => {
    e.preventDefault();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {
      setImage(reader.result);
    };
  };

  return (
    <BasePage
      {...rest}
      onActionClick={onActionClick}
      actionList={[{ name: 'Cancel' }, { name: 'Save', scopeKey: scopeKeys.Create_Loan }]}
    >
      <Card scopeKey={scopeKeys.Create_Loan}>
        {Id && (
          <Input xs={12} required ref={ticketNoRef} label={translate('Ticket No')} value={dataModel._id} disabled />
        )}
        <Input xs={6} required ref={nameRef} label={translate('Name')} value={dataModel.name} />
        <Input xs={6} required ref={surnameRef} label={translate('Surname')} value={dataModel.surname} />
        <Input
          xs={6}
          required
          ref={ageRef}
          label={translate('Age')}
          value={dataModel.age}
          type="number"
          validate={true}
        />
        <Input
          xs={6}
          required
          ref={tcRef}
          label={translate('TC No')}
          value={dataModel.TC}
          minLength={11}
          maxLength={11}
        />
        <Input
          xs={6}
          required
          ref={definitionRef}
          rows={3}
          multiline
          label={translate('Reason for ticket')}
          value={dataModel?.definition}
        />
        <Input
          xs={6}
          required
          ref={addressRef}
          rows={3}
          multiline
          label={translate('Address')}
          value={dataModel.address}
        />
        {!Id ? (
          <Card
            scopeKey={scopeKeys.Public}
            title={translate('{{name}} upload', { name: translate('Image') })}
            showHeader={true}
          >
            <Avatar
              xs={12}
              size="xlarge"
              style={{ marginBottom: '8px', margin: 'auto' }}
              image={image}
              variant="rounded"
            />
            <Button component="label" variant="outlined" startIcon={<GetIcon icon={'import'} />} xs={12}>
              {translate('{{name}} upload', { name: translate('Image') })}
              <input
                type="file"
                name="file"
                style={{ marginTop: '8px', margin: 'auto' }}
                hidden
                onChange={handleUpload.bind(this, 'Icon')}
                accept="image/png, image/jpeg"
              />
            </Button>
          </Card>
        ) : (
          image && (
            <Card scopeKey={scopeKeys.Public} title={translate('Image')} showHeader={true}>
              <Avatar
                xs={12}
                size="xlarge"
                style={{ marginBottom: '8px', margin: 'auto' }}
                image={image}
                variant="rounded"
              />
            </Card>
          )
        )}
        {Id && (
          <SelectEnum
            xs={12}
            name="Status"
            ref={statusRef}
            label={translate('Status')}
            enumName={'StatusType'}
            columns={['Name']}
            valuePath={'Code'}
            value={dataModel.status}
            required
          />
        )}
        {Id && (
          <Input
            xs={12}
            ref={responseRef}
            rows={3}
            multiline
            label={translate('Response')}
            value={dataModel.response}
          />
        )}
      </Card>
    </BasePage>
  );
};

export default withFormPage(SampleDefinition, { uiMetadata });
