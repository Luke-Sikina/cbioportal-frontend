import * as React from 'react';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { isBlock } from 'typescript';
import LinkOutWarning from './LinkOutWarning';

export type LinkOutProps = {
    link: string;
    text: string;
};

@observer
export default class LinkOut extends React.Component<LinkOutProps, {}> {
    @observable
    private showModal: boolean = false;

    constructor(props: LinkOutProps) {
        super(props);
    }

    @autobind
    @action
    setModalToShow() {
        this.showModal = true;
    }

    @autobind
    @action
    setModalToHide() {
        this.showModal = false;
    }

    public render() {
        return (
            <div>
                <a href={'javascript:void'} onClick={this.setModalToShow}>
                    {this.props.text}
                </a>
                {this.showModal && (
                    <LinkOutWarning
                        link={this.props.link}
                        text={this.props.text}
                        onBackClick={this.setModalToHide}
                    />
                )}
            </div>
        );
    }
}
