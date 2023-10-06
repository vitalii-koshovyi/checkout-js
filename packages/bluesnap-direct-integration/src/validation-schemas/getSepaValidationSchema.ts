import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export default memoize(function getSepaValidationSchema(language: LanguageService): ObjectSchema {
    return object({
        iban: string().required(language.translate('payment.sepa_account_number_required')),
    });
});
