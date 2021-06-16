import * as React from 'react';
import './styles.scss';
import { action, computed, makeObservable } from 'mobx';
import { inputBoxChangeTimeoutEvent } from '../../lib/EventUtils';

export interface IDoubleHandleSliderProps {
    id: string;
    min: string;
    max: string;
    callbackLowerValue: (lowerValue: number) => void;
    callbackUpperValue: (upperValue: number) => void;
}

export interface IDoubleHandleSliderState {
    lowerValue: number;
    upperValue: number;
}

const WIDTH = '175px';
export default class DoubleHandleSlider extends React.Component<
    IDoubleHandleSliderProps,
    IDoubleHandleSliderState
> {
    // this is used to prevent unintended changes to the handle positions
    // which may occur once a handle is released, e.g. due to table resizing
    private justReleasedHandle: boolean;
    private min: number; // fixed precision number equivalent to this.props.min
    private max: number; // fixed precision number equivalent to this.props.max
    constructor(props: IDoubleHandleSliderProps) {
        super(props);
        makeObservable(this);

        const PRECISION = 10;
        const POWER = 10 ** PRECISION;
        this.min = +(+this.props.min).toFixed(PRECISION + 1);
        this.max = +(+this.props.max).toFixed(PRECISION + 1);
        this.min = Math.floor(POWER * this.min) / POWER;
        this.max = Math.ceil(POWER * this.max) / POWER;

        this.justReleasedHandle = false;
        this.state = {
            lowerValue: this.min,
            upperValue: this.max,
        };
    }

    componentDidMount() {
        this.syncValues(true);
        this.syncValues(false);
    }
    componentDidUpdate(prevProps: IDoubleHandleSliderProps) {
        // solves bug when two adjacent columns have activated
        // sliders and the left column is deselected
        if (prevProps.id !== this.props.id) {
            this.setState(
                {
                    lowerValue: this.min,
                    upperValue: this.max,
                },
                () => {
                    this.syncValues(true);
                    this.syncValues(false);
                }
            );
        } else {
            this.syncValues(true);
            this.syncValues(false);
        }
    }

    get LHId() {
        return this.props.id + ' lowerValue-handle';
    }
    get UHId() {
        return this.props.id + ' upperValue-handle';
    }
    get LBId() {
        return this.props.id + ' lowerValue-box';
    }
    get UBId() {
        return this.props.id + ' upperValue-box';
    }
    get MIDId() {
        return this.props.id + ' middleTrack';
    }
    get LH() {
        return document.getElementById(this.LHId) as HTMLInputElement;
    }
    get UH() {
        return document.getElementById(this.UHId) as HTMLInputElement;
    }
    get LB() {
        return document.getElementById(this.LBId) as HTMLInputElement;
    }
    get UB() {
        return document.getElementById(this.UBId) as HTMLInputElement;
    }
    get MID() {
        const middleTracks = document.getElementsByClassName('middleTrack');
        for (let i = 0; i < middleTracks.length; i++) {
            if (middleTracks[i].id === this.MIDId) {
                return middleTracks[i] as HTMLElement;
            }
        }
        // should never reach here
        return middleTracks[0] as HTMLElement;
    }

    @computed get defaultStepSize() {
        if (this.props.min.includes('.') || this.props.max.includes('.')) {
            return (this.max - this.min) / 100;
        } else {
            return 1;
        }
    }

    private syncValues(isLower: boolean, includeCallback?: boolean) {
        if (isLower) {
            this.LH.value = '' + this.state.lowerValue;
            this.LB.value = '' + this.state.lowerValue;

            const percentLeft =
                (this.state.lowerValue - this.min) / (this.max - this.min);
            this.MID.style.left = 100 * percentLeft + '%';

            if (includeCallback) {
                this.props.callbackLowerValue(this.state.lowerValue);
            }
        } else {
            this.UH.value = '' + this.state.upperValue;
            this.UB.value = '' + this.state.upperValue;

            const percentRight =
                (this.max - this.state.upperValue) / (this.max - this.min);
            this.MID.style.right = 100 * percentRight + '%';

            if (includeCallback) {
                this.props.callbackUpperValue(this.state.upperValue);
            }
        }

        this.updateInputBoxWidth(isLower);
    }

    private updateInputBoxWidth(isLower: boolean) {
        if (isLower) {
            this.LB.style.width = this.LB.value.length + 1 + 'ch';
        } else {
            this.UB.style.width = this.UB.value.length + 1 + 'ch';
        }
    }

    @action
    private onChangeInputBox(
        limit: number,
        otherHandle: number,
        isBeyondLimit: (x: number) => boolean,
        wouldCrossHandles: (x: number) => boolean,
        updateState: (x: number) => void,
        syncValuesNoUpdate: () => void
    ) {
        return (() =>
            inputBoxChangeTimeoutEvent(input => {
                if (!input || isBeyondLimit(+input)) {
                    updateState(limit);
                } else if (wouldCrossHandles(+input)) {
                    updateState(otherHandle);
                } else if (!isNaN(+input)) {
                    updateState(+input);
                } else {
                    syncValuesNoUpdate();
                }
            }, 300))();
    }

    @action
    private onChangeSlider(
        isLower: boolean,
        wouldCrossHandles: (x: number) => boolean,
        updateState: (x: number) => void
    ) {
        return (e: any) => {
            if (this.justReleasedHandle) {
                this.justReleasedHandle = false;
                this.syncValues(isLower);
            } else {
                const otherHandle = isLower
                    ? this.state.upperValue
                    : this.state.lowerValue;
                const newValue = wouldCrossHandles(+e.target.value)
                    ? otherHandle
                    : +e.target.value;
                updateState(newValue);
            }
        };
    }

    render() {
        return (
            <div
                style={{
                    width: WIDTH,
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div className="slider">
                    <div className="mainTrack" />
                    <div id={this.MIDId} className="middleTrack" />
                    <input
                        type="range"
                        id={this.LHId}
                        className="handle"
                        min={this.min}
                        max={this.max}
                        step={this.defaultStepSize}
                        defaultValue={'' + this.state.lowerValue}
                        onMouseUp={(e: any) => {
                            this.justReleasedHandle = true;
                            this.setState({ lowerValue: +e.target.value }, () =>
                                this.syncValues(true, true)
                            );
                        }}
                        onChange={this.onChangeSlider(
                            true,
                            (x: number) => x > this.state.upperValue,
                            (x: number) =>
                                this.setState({ lowerValue: x }, () =>
                                    this.syncValues(true)
                                )
                        )}
                    />
                    <input
                        type="range"
                        id={this.UHId}
                        className="handle"
                        min={this.min}
                        max={this.max}
                        step={this.defaultStepSize}
                        defaultValue={'' + this.state.upperValue}
                        onMouseUp={(e: any) => {
                            this.justReleasedHandle = true;
                            this.setState({ upperValue: +e.target.value }, () =>
                                this.syncValues(false, true)
                            );
                        }}
                        onChange={this.onChangeSlider(
                            false,
                            (x: number) => x < this.state.lowerValue,
                            (x: number) =>
                                this.setState({ upperValue: x }, () =>
                                    this.syncValues(false)
                                )
                        )}
                    />
                </div>

                <div style={{ marginTop: '13px' }}>
                    <input
                        id={this.LBId}
                        style={{ float: 'left', maxWidth: WIDTH }}
                        defaultValue={'' + this.state.lowerValue}
                        onChange={this.onChangeInputBox(
                            this.min,
                            this.state.upperValue,
                            (x: number) => x < this.min,
                            (x: number) => x > this.state.upperValue,
                            (x: number) =>
                                this.setState({ lowerValue: x }, () =>
                                    this.syncValues(true, true)
                                ),
                            () => this.syncValues(true)
                        )}
                        onInput={() => this.updateInputBoxWidth(true)}
                    />
                    <input
                        id={this.UBId}
                        style={{ float: 'right', maxWidth: WIDTH }}
                        defaultValue={'' + this.state.upperValue}
                        onChange={this.onChangeInputBox(
                            this.max,
                            this.state.lowerValue,
                            (x: number) => x > this.max,
                            (x: number) => x < this.state.lowerValue,
                            (x: number) =>
                                this.setState({ upperValue: x }, () =>
                                    this.syncValues(false, true)
                                ),
                            () => this.syncValues(false)
                        )}
                        onInput={() => this.updateInputBoxWidth(false)}
                    />
                </div>
            </div>
        );
    }
}
