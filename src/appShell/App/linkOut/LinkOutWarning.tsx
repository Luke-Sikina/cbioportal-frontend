import * as React from 'react';
import './linkOut.scss';
import autobind from 'autobind-decorator';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { isBlock } from 'typescript';

export type LinkOutWarningProps = {
    link: string;
    text: string;
    onBackClick: () => void;
};

@observer
export default class LinkOutWarning extends React.Component<
    LinkOutWarningProps,
    {}
> {
    @observable
    private countdown: number = 15; // seconds

    private intervals: any[] = [];

    constructor(props: LinkOutWarningProps) {
        super(props);
    }

    @autobind
    componentDidMount() {
        this.intervals = [
            setInterval(this.navigateToLink, this.countdown * 1000),
            setInterval(this.decrementTimer, 1000),
        ];
    }

    @autobind
    @action
    decrementTimer() {
        this.countdown--;
    }

    @autobind
    navigateToLink() {
        window.location.href = this.props.link;
    }

    @autobind
    returnToPortal(a: any) {
        this.intervals.forEach(clearInterval);
        this.props.onBackClick();
    }

    stopParentEvent(e: any) {
        e.stopPropagation();
    }

    public render() {
        return (
            <div
                className="redirect-background-gradient"
                onClick={this.returnToPortal}
            >
                <div
                    onClick={this.stopParentEvent}
                    className="redirect-outer-container"
                >
                    <div className="redirect-inner-container">
                        <h1>Redirect Notice</h1>
                        <div>
                            <p>
                                You are now leaving cbioportal.dfci.harvard.edu.
                            </p>
                            <div>
                                <div>
                                    This page will automatically redirect you to
                                </div>
                                <a href={this.props.link}>{this.props.link}</a>
                                <div>in {this.countdown} seconds.</div>
                            </div>
                        </div>
                        <div>
                            <button
                                className="btn btn-primary"
                                onClick={this.navigateToLink}
                            >
                                Continue
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={this.returnToPortal}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
