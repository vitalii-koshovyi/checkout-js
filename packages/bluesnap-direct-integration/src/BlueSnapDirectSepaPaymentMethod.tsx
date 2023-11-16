import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import {
    PaymentMethodProps,
    PaymentMethodResolveId,
    toResolvableComponent,
} from '@bigcommerce/checkout/payment-integration-api';
import { CheckboxFormField, Fieldset, Legend } from '@bigcommerce/checkout/ui';

import BlueSnapDirectNumberField from './BlueSnapDirectNumberField';
import BlueSnapDirectTextField from './BlueSnapDirectTextField';
import getSepaValidationSchema from './validation-schemas/getSepaValidationSchema';

interface SepaCreditor {
    sepaCreditorAddress: string;
    sepaCreditorCity: string;
    sepaCreditorCompanyName: string;
    sepaCreditorCountry: string;
    sepaCreditorIdentifier: string;
    sepaCreditorPostalCode: string;
}

const BlueSnapDirectSepaPaymentMethod: FunctionComponent<PaymentMethodProps> = ({
    method,
    checkoutService: { initializePayment, deinitializePayment },
    checkoutState: {
        data: { isPaymentDataRequired, getBillingAddress },
    },
    paymentForm: { disableSubmit, setValidationSchema },
    language,
}) => {
    const billingAddress = getBillingAddress();

    if (!billingAddress) {
        throw new Error('Billing address is missing');
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
    // TODO: Remove fallback
    const creditor: SepaCreditor = method.initializationData.sepaCreditor || {
        sepaCreditorCompanyName: 'Test Store',
        sepaCreditorAddress: 'Horyva 5',
        sepaCreditorPostalCode: '04116',
        sepaCreditorCity: 'Kyiv',
        sepaCreditorCountry: 'Ukraine',
    };

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
            <BlueSnapDirectTextField
                labelContent={language.translate('address.first_name_label')}
                maxLength={17}
                name="firstName"
                useFloatingLabel={true}
            />
            <BlueSnapDirectTextField
                labelContent={language.translate('address.last_name_label')}
                maxLength={17}
                name="lastName"
                useFloatingLabel={true}
            />

            <CheckboxFormField
                labelContent={language.translate(
                    'payment.bluesnap_direct_sepa_mandate_disclaimer',
                    {
                        creditorName: creditor.sepaCreditorCompanyName,
                    },
                )}
                name="sepaMandate"
                onChange={toggleSubmitButton}
            />
        </Fieldset>
    );
};

export default toResolvableComponent<PaymentMethodProps, PaymentMethodResolveId>(
    BlueSnapDirectSepaPaymentMethod,
    // TODO: SEPA
    [{ id: 'giropay', gateway: 'bluesnapdirect' }],
);
