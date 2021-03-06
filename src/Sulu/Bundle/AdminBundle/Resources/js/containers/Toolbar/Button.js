// @flow
import classNames from 'classnames';
import React from 'react';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import type {Button as ButtonProps} from './types';
import buttonStyles from './button.scss';

const ICON_ARROW_DOWN = 'chevron-down';

export default class Button extends React.PureComponent<ButtonProps> {
    static defaultProps = {
        disabled: false,
        hasOptions: false,
        active: false,
    };

    handleOnClick = () => {
        this.props.onClick();
    };

    render() {
        const {
            icon,
            size,
            skin,
            value,
            active,
            loading,
            disabled,
            hasOptions,
        } = this.props;
        const buttonClass = classNames(
            buttonStyles.button,
            {
                [buttonStyles.active]: active,
                [buttonStyles[size]]: size,
                [buttonStyles[skin]]: skin,
            }
        );
        const loaderClass = classNames(buttonStyles.loader);
        const buttonContent = this.props.children || value;

        return (
            <button
                disabled={disabled}
                className={buttonClass}
                onClick={this.handleOnClick}
                value={value}
            >
                {loading &&
                    <Loader className={loaderClass} />
                }
                {icon &&
                    <Icon name={icon} className={buttonStyles.icon} />
                }
                {buttonContent &&
                    <span className={buttonStyles.label}>{buttonContent}</span>
                }
                {hasOptions &&
                    <Icon name={ICON_ARROW_DOWN} className={buttonStyles.dropdownIcon} />
                }
            </button>
        );
    }
}
