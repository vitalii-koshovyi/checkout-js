import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    AccountInstrumentFieldset,
    StoreInstrumentFieldset,
} from '@bigcommerce/checkout/instrument-utils';
import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BlueSnapDirectEcpFieldset from './fields/BlueSnapDirectEcpFieldset';
import useEcpInstruments from './hooks/useEcpInstruments';
import getEcpValidationSchema from './validation-schemas/getEcpValidationSchema';

const BlueSnapDirectEcpPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    checkoutState: {
        data: { isPaymentDataRequired },
    },
    paymentForm: { disableSubmit, setValidationSchema },
    language,
}) => {
    const [disabled, setDisabled] = useState(true);
    const onChange = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeEcp = useCallback(async () => {
        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method]);

    const deinitializeEcp = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeEcp();

        return () => {
            void deinitializeEcp();
        };
    }, [deinitializeEcp, initializeEcp]);

    const {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
        shouldConfirmInstrument,
    } = useEcpInstruments(method);

    const shouldShowForm =
        !shouldShowInstrumentFieldset || shouldCreateNewInstrument || shouldConfirmInstrument;

    useEffect(() => {
        setValidationSchema(method, getEcpValidationSchema(language, shouldShowForm));
    }, [language, shouldShowForm, setValidationSchema, method]);

    return (
        <Fieldset
            legend={
                <Legend hidden>
                    {language.translate('payment.bluesnap_direct_electronic_check_label')}
                </Legend>
            }
            style={{ paddingBottom: '1rem' }}
        >
            {shouldShowInstrumentFieldset && (
                <div className="checkout-ach-form__instrument">
                    <AccountInstrumentFieldset
                        instruments={accountInstruments}
                        onSelectInstrument={handleSelectInstrument}
                        onUseNewInstrument={handleUseNewInstrument}
                        selectedInstrument={currentInstrument}
                    />
                </div>
            )}
            {shouldShowForm && <BlueSnapDirectEcpFieldset language={language} />}
            <CheckboxFormField
                labelContent={language.translate('payment.bluesnap_direct_permission')}
                name="shopperPermission"
                onChange={onChange}
            />
            {isInstrumentFeatureAvailable && (
                <StoreInstrumentFieldset
                    instrumentId={currentInstrument?.bigpayToken}
                    isAccountInstrument
                />
            )}
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectEcpPaymentMethod,
    [{ id: 'ecp', gateway: 'bluesnapdirect' }],
);
