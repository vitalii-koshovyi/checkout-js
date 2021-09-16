import classNames from 'classnames';
import React, { memo, FunctionComponent } from 'react';

import CreditCardIcon from './CreditCardIcon';

export const SUPPORTED_CARD_TYPES = [
    'american-express',
    'carnet',
    'cb',
    'dankort',
    'diners-club',
    'discover',
    'elo',
    'hiper',
    'jcb',
    'mada',
    'maestro',
    'mastercard',
    'troy',
    'unionpay',
    'visa',
];

export interface CreditCardIconListProps {
    selectedCardType?: string;
    supportedCardsLogosUrls?: string[];
    cardTypes: string[];
}

const CreditCardIconList: FunctionComponent<CreditCardIconListProps> = ({
    selectedCardType,
    cardTypes,
    supportedCardsLogosUrls,
}) => {
    const filteredCardTypes = cardTypes
        .filter(type => SUPPORTED_CARD_TYPES.indexOf(type) !== -1);

    if (!filteredCardTypes.length) {
        return null;
    }

    console.log({supportedCardsLogosUrls});

    return (
        <ul className="creditCardTypes-list">
            { supportedCardsLogosUrls && supportedCardsLogosUrls.map(url => (
                <li
                    className={ classNames(
                        'creditCardTypes-list-item'
                    ) }
                    key={ url }
                >
                    <span className="cardIcon">
                        <img className="icon--small" src={ url } />
                    </span>
                </li>
            )) }
            { !supportedCardsLogosUrls && filteredCardTypes.map(type => (
                <li
                    className={ classNames(
                        'creditCardTypes-list-item',
                        { 'is-active': selectedCardType === type },
                        { 'not-active': selectedCardType && selectedCardType !== type}
                    ) }
                    key={ type }
                >
                    <span className="cardIcon">
                        <CreditCardIcon cardType={ type } />
                    </span>
                </li>
            )) }
        </ul>
    );
};

export default memo(CreditCardIconList);
