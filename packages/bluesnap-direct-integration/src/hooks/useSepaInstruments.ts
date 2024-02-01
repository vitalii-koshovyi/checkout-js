import { BankInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { find } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

import { isSepaInstrument } from '@bigcommerce/checkout/instrument-utils';
import { useCheckout, usePaymentFormContext } from '@bigcommerce/checkout/payment-integration-api';

const useSepaInstruments = (method: PaymentMethod) => {
    console.log(123);

    const [currentInstrument, setCurrentInstrument] = useState<BankInstrument | undefined>();

    const { checkoutState } = useCheckout();
    const customer = checkoutState.data.getCustomer();
    const instruments = checkoutState.data.getInstruments(method) || [];

    const { paymentForm } = usePaymentFormContext();
    const { setFieldValue } = paymentForm;

    const accountInstruments = instruments.filter(isSepaInstrument);
    const isInstrumentFeatureAvailable =
        !customer?.isGuest && Boolean(method.config.isVaultingEnabled);

    const shouldShowInstrumentFieldset =
        isInstrumentFeatureAvailable && accountInstruments.length > 0;
    const shouldCreateNewInstrument = shouldShowInstrumentFieldset && !currentInstrument;

    const getDefaultInstrument = useCallback((): BankInstrument | undefined => {
        if (!accountInstruments.length) {
            return;
        }

        const defaultAccountInstrument = accountInstruments.filter(
            ({ defaultInstrument }) => defaultInstrument,
        );

        return defaultAccountInstrument[0] || accountInstruments[0];
    }, [accountInstruments]);

    useEffect(() => {
        console.log('setCurrentInstrument');
        setCurrentInstrument(isInstrumentFeatureAvailable ? getDefaultInstrument() : undefined);
    }, [isInstrumentFeatureAvailable, getDefaultInstrument]);

    useEffect(() => {
        if (!shouldShowInstrumentFieldset) {
            setFieldValue('instrumentId', '');
        }
    }, [setFieldValue, shouldShowInstrumentFieldset]);

    const handleSelectInstrument = useCallback(
        (id: string) => {
            console.log('handleSelectInstrument');
            setCurrentInstrument(find(accountInstruments, { bigpayToken: id }));
            setFieldValue('instrumentId', id);
            setFieldValue('shouldSetAsDefaultInstrument', false);
        },
        [accountInstruments, setFieldValue],
    );

    const handleUseNewInstrument = useCallback(() => {
        console.log('handleUseNewInstrument');
        setCurrentInstrument(undefined);
        setFieldValue('instrumentId', '');
        setFieldValue('shouldSaveInstrument', false);
        setFieldValue('shouldSetAsDefaultInstrument', false);
    }, [setFieldValue]);

    console.log({
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
    });

    return {
        accountInstruments,
        currentInstrument,
        handleSelectInstrument,
        handleUseNewInstrument,
        isInstrumentFeatureAvailable,
        shouldShowInstrumentFieldset,
        shouldCreateNewInstrument,
    };
};

export default useSepaInstruments;
