import * as React from 'react';
import { observer } from 'mobx-react';
import Helmet from 'react-helmet';
import { PageLayout } from 'shared/components/PageLayout/PageLayout';

type State = {
    checkBox1: boolean;
    checkBox2: boolean;
    checkBox3: boolean;
};

@observer
export default class DownloadProfileData extends React.Component<{}, State> {
    constructor() {
        super({});
        this.state = {
            checkBox1: false,
            checkBox2: false,
            checkBox3: false,
        };
    }

    public render() {
        return (
            <PageLayout className={'whiteBackground staticPage'}>
                <Helmet>
                    <title>{'Download Profile Data'}</title>
                </Helmet>
                <div>
                    <p
                        style={{
                            fontSize: '24px !important',
                            fontFamily: '"Roboto", sans-serif',
                            lineHeight: '28px',
                            fontWeight: 100,
                        }}
                    >
                        {' '}
                        Registered users can now download all de-identified
                        Profile Data. Please review the terms of access below.
                        Note that these terms are identical to the terms of
                        access you agreed to upon registration.
                    </p>
                    <br />
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 900,
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        I agree not to redistribute cBioPortal data, either
                        internally or externally.
                        <span style={{ color: 'red', display: 'inline' }}>
                            *
                        </span>
                    </p>
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 100,
                            color: 'grey',
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        For example, you agree not to download data from the
                        portal and make it available on a DFCI web server, or
                        email the data file to a colleague outside of DFCI, BWH
                        or BCH.
                    </p>
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox1: true,
                            })
                        }
                        checked={this.state.checkBox1}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Agree</label>
                    <br />
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox1: false,
                            })
                        }
                        checked={!this.state.checkBox1}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Disagree</label>
                    <br />
                    <br />
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 900,
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        I agree not to use any data within the portal to
                        re-identify a patient.
                        <span style={{ color: 'red', display: 'inline' }}>
                            *
                        </span>
                    </p>
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 100,
                            color: 'grey',
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        For example, you agree not to use some combination of
                        genomic data plus de-identified clinical data to
                        re-identify a patient.
                    </p>
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox2: true,
                            })
                        }
                        checked={this.state.checkBox2}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Agree</label>
                    <br />
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox2: false,
                            })
                        }
                        checked={!this.state.checkBox2}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Disagree</label>
                    <br />
                    <br />
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 900,
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        I agree to contact and receive approval from the
                        appropriate Data Use Committee through OncDRS prior to
                        publishing any results derived from cBioPortal or
                        Profile.
                        <span style={{ color: 'red', display: 'inline' }}>
                            *
                        </span>
                    </p>
                    <p
                        style={{
                            fontFamily: '"Roboto", sans-serif',
                            fontWeight: 100,
                            color: 'grey',
                            lineHeight: '22px',
                            fontSize: '18px !important',
                        }}
                    >
                        This is required by the Profile Project, DFCI IRB
                        protocol 11-104.
                    </p>
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox3: true,
                            })
                        }
                        checked={this.state.checkBox3}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Agree</label>
                    <br />
                    <input
                        type="radio"
                        onChange={() =>
                            this.setState({
                                checkBox3: false,
                            })
                        }
                        checked={!this.state.checkBox3}
                        style={{ marginLeft: '5px' }}
                    />{' '}
                    <label style={{ fontSize: '14px' }}>Disagree</label>
                    <br />
                    <br />
                    <form action="profile_latest.tar.gz">
                        <button
                            type="submit"
                            id="button"
                            disabled={
                                !(
                                    this.state.checkBox1 &&
                                    this.state.checkBox2 &&
                                    this.state.checkBox3
                                )
                            }
                            style={{
                                width: '150px',
                                height: '50px',
                                borderRadius: '5px',
                                backgroundColor: !(
                                    this.state.checkBox1 &&
                                    this.state.checkBox2 &&
                                    this.state.checkBox3
                                )
                                    ? 'grey'
                                    : '#228B22',
                                borderColor: !(
                                    this.state.checkBox1 &&
                                    this.state.checkBox2 &&
                                    this.state.checkBox3
                                )
                                    ? 'grey'
                                    : '#228B22',
                                color: 'white',
                                borderStyle: 'hidden',
                            }}
                        >
                            Download
                        </button>
                    </form>
                </div>
            </PageLayout>
        );
    }
}
