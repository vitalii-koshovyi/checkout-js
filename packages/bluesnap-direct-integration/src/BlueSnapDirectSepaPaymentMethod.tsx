import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BlueSnapDirectNumberField from './BlueSnapDirectNumberField';
import getSepaValidationSchema from './validation-schemas/getSepaValidationSchema';

const BlueSnapDirectSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    checkoutState: {
        data: { isPaymentDataRequired },
    },
    paymentForm: { disableSubmit, setValidationSchema },
    language,
}) => {
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
        setValidationSchema(method, getSepaValidationSchema(language));

        await initializePayment({
            gatewayId: method.gateway,
            methodId: method.id,
        });
    }, [initializePayment, method, setValidationSchema, language]);

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

    return (
        <Fieldset
            legend={
                <Legend hidden>
                    {language.translate('payment.bluesnap_direct_sepa_direct_debit')}
                </Legend>
            }
            style={{ paddingBottom: '1rem' }}
        >
            <BlueSnapDirectNumberField
                labelContent={language.translate('payment.bluesnap_direct_iban.label')}
                maxLength={17}
                name="iban"
                useFloatingLabel={true}
            />

            <CheckboxFormField
                labelContent={language.translate('payment.bluesnap_direct_permission', {
                    creditorName: 'creditor.sepaCreditorCompanyName',
                })}
                name="sepaMandate"
                onChange={toggleSubmitButton}
            />
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectSepaPaymentMethod,
    [{ id: 'sepa', gateway: 'bluesnapdirect' }],
);
