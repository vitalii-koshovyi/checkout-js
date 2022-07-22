import { AdyenV3ValidationState, CardInstrument, PaymentMethod } from '@bigcommerce/checkout-sdk';
import classNames from 'classnames';
import React, { useContext, useEffect, useState, FunctionComponent } from 'react';

import { TranslatedString } from '../../locale';
import PaymentContext from '../PaymentContext';

export type FieldsValidation = {[key in AdyenV3CardFields]?: AdyenV3ValidationState};

enum AdyenV3CardFields {
    CardNumber = 'encryptedCardNumber',
    SecurityCode = 'encryptedSecurityCode',
    ExpiryDate = 'encryptedExpiryDate',
}

export interface AdyenV3CardValidationProps {
    verificationFieldsContainerId?: string;
    shouldShowNumberField: boolean;
    paymentMethod: PaymentMethod;
    cardValidationState?: AdyenV3ValidationState;
    selectedInstrument?: CardInstrument;
}

const AdyenV3CardValidation: FunctionComponent<AdyenV3CardValidationProps> = ({
    verificationFieldsContainerId,
    shouldShowNumberField,
    selectedInstrument,
    paymentMethod,
    cardValidationState,
}) => {
    const paymentContext = useContext(PaymentContext);

    const shouldShowSecurityCode = paymentMethod.method === 'scheme';
    const shoudlShowExpiryDate = paymentMethod.method === 'bcmc';

    const validationState: FieldsValidation = {}
    if (shouldShowNumberField) {
        validationState[AdyenV3CardFields.CardNumber] = { valid: false };
    }
    if (shouldShowSecurityCode) {
        validationState[AdyenV3CardFields.SecurityCode] = { valid: false };
    }
    if (shoudlShowExpiryDate) {
        validationState[AdyenV3CardFields.ExpiryDate] = { valid: false };
    }

    const [ fieldsValidation, setFieldsValidation ] = useState<FieldsValidation>(validationState);

    useEffect(() => {
        if (!cardValidationState) {
            return;
        }
        

        if (cardValidationState.fieldType) {
            if(cardValidationState.fieldType === AdyenV3CardFields.CardNumber) {
                setFieldsValidation({
                    ...fieldsValidation,
                    [AdyenV3CardFields.CardNumber]: cardValidationState?.endDigits !== selectedInstrument?.last4 ?
                        { ...cardValidationState, valid: false } :
                        { ...cardValidationState },
                })
            } else {
                setFieldsValidation({
                    ...fieldsValidation,
                    [cardValidationState.fieldType]: cardValidationState,
                })
            }
        }

    }, [cardValidationState]);

    const isFieldInvalid = (fieldKey: AdyenV3CardFields): boolean => !!fieldsValidation[fieldKey] && !fieldsValidation[fieldKey]?.valid;

    useEffect(() => {
        paymentContext?.disableSubmit(paymentMethod, Object.values(fieldsValidation).some(field => !field?.valid));
    }, [fieldsValidation]);

    useEffect(() => {
        if (selectedInstrument?.bigpayToken) {
            setFieldsValidation(validationState);
        } else {
            paymentContext?.disableSubmit(paymentMethod, false);
        }
    }, [selectedInstrument]);


    const showValidationIcon = (key: AdyenV3CardFields) => isFieldInvalid(key) && (
        <span className="adyen-checkout-input__inline-validation adyen-checkout-input__inline-validation--invalid" style={ {transform: 'none', right: '20px'} }>
            <img className="adyen-checkout__icon" src="https://checkoutshopper-test.adyen.com/checkoutshopper/images/components/field_error.svg" />
        </span>
    );

    return (
        <div>
            { shouldShowNumberField && <p>
                <strong>
                    <TranslatedString id="payment.instrument_trusted_shipping_address_title_text" />
                </strong>

                <br />

                <TranslatedString id="payment.instrument_trusted_shipping_address_text" />
            </p> }

            <div className="form-ccFields" id={ verificationFieldsContainerId }>
                <div className={ classNames(
                    'form-field',
                    'form-field--ccNumber',
                    { 'form-field--ccNumber--hasExpiryDate': paymentMethod.method === 'bcmc' },
                    // This div is hiding by CSS because there is an Adyen library in
                    // checkout-sdk which mounts verification fields and if is removed with JS this mounting event will be thrown an error
                    { 'form-field-ccNumber--hide': !shouldShowNumberField }
                    ) }
                >
                    <label htmlFor={ AdyenV3CardFields.CardNumber }>
                        <TranslatedString id="payment.credit_card_number_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.CardNumber) }
                        ) }
                        data-cse={ AdyenV3CardFields.CardNumber }
                        id={ AdyenV3CardFields.CardNumber }
                    />
                    { showValidationIcon(AdyenV3CardFields.CardNumber) }
                </div>

                { shouldShowSecurityCode && <div className="form-field form-ccFields-field--ccCvv">
                    <label htmlFor={ AdyenV3CardFields.SecurityCode }>
                        <TranslatedString id="payment.credit_card_cvv_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.SecurityCode) }
                        ) }
                        data-cse={ AdyenV3CardFields.SecurityCode }
                        id={ AdyenV3CardFields.SecurityCode }
                    />
                    { showValidationIcon(AdyenV3CardFields.SecurityCode) }
                </div> }
                { shoudlShowExpiryDate && <div className="form-field form-field--ccExpiry">
                    <label htmlFor={ AdyenV3CardFields.ExpiryDate }>
                        <TranslatedString id="payment.credit_card_expiration_label" />
                    </label>
                    <div
                        className={ classNames(
                            'form-input',
                            'optimizedCheckout-form-input',
                            'has-icon',
                            'adyen-checkout__input-wrapper',
                            { 'adyen-checkout__input--error': isFieldInvalid(AdyenV3CardFields.ExpiryDate) }
                        ) }
                        data-cse={ AdyenV3CardFields.ExpiryDate }
                        id={ AdyenV3CardFields.ExpiryDate }
                    />
                    { showValidationIcon(AdyenV3CardFields.ExpiryDate) }
                </div> }
            </div>
        </div>
    );
};

export default AdyenV3CardValidation;
