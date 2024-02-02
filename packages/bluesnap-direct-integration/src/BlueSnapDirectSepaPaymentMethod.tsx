import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';

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

import { isBlueSnapDirectInitializationData } from './BlueSnapDirectInitializationData';
import BlueSnapDirectTextField from './fields/BlueSnapDirectTextField';
import useSepaInstruments from './hooks/useSepaInstruments';
import getSepaValidationSchema from './validation-schemas/getSepaValidationSchema';

const BlueSnapDirectSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = (props) => {
    const {
        method,
        checkoutService: { initializePayment, deinitializePayment },
        checkoutState: {
            data: { isPaymentDataRequired },
        },
        paymentForm: { disableSubmit, setValidationSchema },
        language,
    } = props;

    const prev = useRef(props);

    if (!isBlueSnapDirectInitializationData(method.initializationData)) {
        throw new Error('Unable to get initialization data');
    }

    const [disabled, setDisabled] = useState(true);
    const toggleSubmitButton = useCallback(
        (shopperPermission: boolean) => setDisabled(!shopperPermission),
        [setDisabled],
    );

    useEffect(
        () => disableSubmit(method, isPaymentDataRequired() && disabled),
        [disableSubmit, disabled, isPaymentDataRequired, method],
    );

    const initializeSepa = useCallback(async () => {
        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method]);

    const deinitializeSepa = useCallback(async () => {
        await deinitializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [deinitializePayment, method.gateway, method.id]);

    useEffect(() => {
        void initializeSepa();

        return () => {
            void deinitializeSepa();
        };
    }, [deinitializeSepa, initializeSepa]);

    const {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
    } = useSepaInstruments(method);

    const shouldShowForm = !shouldShowInstrumentFieldset || shouldCreateNewInstrument;

    useEffect(() => {
        setValidationSchema(method, getSepaValidationSchema(language, shouldShowForm));
    }, [language, shouldShowForm, setValidationSchema, method]);

    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }

            return ps;
        }, {});

        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }

        prev.current = props;
    });

    return (
        <Fieldset
            legend={
                <Legend hidden>
                    {language.translate('payment.bluesnap_direct_sepa_direct_debit')}
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
            {shouldShowForm && (
                <>
                    <BlueSnapDirectTextField
                        autoComplete="iban"
                        labelContent={language.translate('payment.bluesnap_direct_iban.label')}
                        name="iban"
                        useFloatingLabel={true}
                    />
                    <BlueSnapDirectTextField
                        labelContent={language.translate('address.first_name_label')}
                        name="firstName"
                        useFloatingLabel={true}
                    />
                    <BlueSnapDirectTextField
                        labelContent={language.translate('address.last_name_label')}
                        name="lastName"
                        useFloatingLabel={true}
                    />
                </>
            )}

            <CheckboxFormField
                labelContent={language.translate(
                    'payment.bluesnap_direct_sepa_mandate_disclaimer',
                    {
                        creditorName: method.initializationData.sepaCreditorCompanyName,
                    },
                )}
                name="shopperPermission"
                onChange={toggleSubmitButton}
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
    BlueSnapDirectSepaPaymentMethod,
    [{ id: 'sepa_direct_debit', gateway: 'bluesnapdirect' }],
);
