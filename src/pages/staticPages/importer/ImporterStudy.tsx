import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import { MobxPromiseUnionType } from 'mobxpromise';
import { observer } from 'mobx-react';
import { observable, action, computed } from 'mobx';
import autobind from 'autobind-decorator';

import { remoteData } from 'cbioportal-frontend-commons';

import internalclient from 'shared/api/cbioportalInternalClientInstance';
import { ImportStudy, ImportLog } from 'cbioportal-ts-api-client';

import { dateOrNever, parseUrlParams } from './importerUtil';
import ImporterHelp from './ImporterHelp';

const panelStyle = {
    width: '50%',
    margin: '10px',
    borderRadius: '5px',
    padding: '5px',
    background: '#ededed',
};

const IMPORTING_TEXT =
    'Your import is running. This process can take several minutes depending ' +
    'on the size of your study. Refresh the page to see if it has completed.';
const VALIDATING_TEXT =
    'Your validation is running. This process can take several minutes' +
    ' depending on the size of your study. Refresh the page to see if it has completed.';

export type ImporterStudyProps = {
    match: {
        params: {
            studyId: string;
        };
    };
};

@observer
export default class ImporterStudy extends React.Component<
    ImporterStudyProps,
    {}
> {
    @observable
    private displayHelp: boolean = !!parseUrlParams().help;
    @observable
    private importClicked: boolean = true;
    @observable
    private validateClicked: boolean = true;
    @observable
    private importLogs: MobxPromiseUnionType<ImportLog[]>;
    @observable
    private validationLogs: MobxPromiseUnionType<ImportLog[]>;
    @observable
    private study: MobxPromiseUnionType<ImportStudy>;
    @observable
    private importButtonInfo: JSX.Element;
    @observable
    private validationButtonInfo: JSX.Element;

    constructor(props: ImporterStudyProps) {
        super(props);
        const self = this;
        const studyId = props.match.params.studyId;

        this.study = remoteData<ImportStudy>({
            await: () => [],
            invoke: async () => {
                return internalclient.getImporterStudyUsingGET({
                    studyId: studyId,
                });
            },
            onResult: (study: ImportStudy) => {
                self.updateButtonStates(study);
            },
        });

        this.importLogs = remoteData<ImportLog[]>({
            await: () => [],
            invoke: async () => {
                return internalclient.getAllLogsForStudyUsingGET({
                    logType: 'import',
                    studyId: studyId,
                });
            },
        });

        this.validationLogs = remoteData<ImportLog[]>({
            await: () => [],
            invoke: async () => {
                return internalclient.getAllLogsForStudyUsingGET({
                    logType: 'validation',
                    studyId: studyId,
                });
            },
        });
    }

    @autobind
    updateButtonStates(study: ImportStudy) {
        this.importClicked = study.importRunning;
        this.validateClicked = study.validationRunning;

        if (this.importClicked) {
            this.importButtonInfo = <p>{IMPORTING_TEXT}</p>;
        }

        if (this.validateClicked) {
            this.validationButtonInfo = <p>{VALIDATING_TEXT}</p>;
        }
    }

    renderLogs(logs: ImportLog[]): JSX.Element[] {
        return logs.map(log => {
            var rowClass = 'pending';
            if (log.passed === 'passed') {
                rowClass = 'positive';
            }
            if (log.passed === 'failed') {
                rowClass = 'negative';
            }
            return (
                <tr
                    className={rowClass}
                    key={log.id + log.logType + log.studyId}
                >
                    <td>{dateOrNever(log.startDate)}</td>
                    <td>
                        <Link
                            to={`/logs/${log.logType}/${log.studyId}/${log.id}?raw=false`}
                        >
                            <Button>View HTML Report</Button>
                        </Link>
                    </td>
                    <td>
                        <Link
                            to={`/logs/${log.logType}/${log.studyId}/${log.id}?raw=true`}
                        >
                            <Button>View Raw Log</Button>
                        </Link>
                    </td>
                    <td>{log.requester}</td>
                    <td>
                        {log.logType === 'import'
                            ? log.testRun
                                ? 'test import '
                                : 'cBioPortal import '
                            : 'validation '}
                        {log.passed}
                    </td>
                </tr>
            );
        });
    }

    @computed
    private get importButtonText() {
        return this.importClicked
            ? 'Running test import...'
            : 'Run Test Import';
    }

    @computed
    private get validationButtonText() {
        return this.validateClicked
            ? 'Running test validation...'
            : 'Run Test Validation';
    }

    @computed
    private get lastTestImport(): string {
        if (this.importLogs.isPending) {
            return 'Loading...';
        }

        const passingTestImports = this.importLogs.result!.filter(
            log => log.testRun && log.passed === 'passed'
        );
        if (passingTestImports.length == 0) {
            return 'Never';
        }
        return dateOrNever(passingTestImports[0].startDate);
    }

    @computed
    private get lastProdImport(): string {
        if (this.importLogs.isPending) {
            return 'Loading...';
        }

        const passingTestImports = this.importLogs.result!.filter(
            log => !log.testRun && log.passed === 'passed'
        );
        if (passingTestImports.length == 0) {
            return 'Never';
        }
        return dateOrNever(passingTestImports[0].startDate);
    }

    @computed
    get lastValidation(): string {
        if (this.validationLogs.isPending) {
            return 'Loading...';
        }

        const passingValidations = this.validationLogs.result!.filter(
            log => log.passed === 'passed'
        );
        if (passingValidations.length == 0) {
            return 'Never';
        }
        return dateOrNever(passingValidations[0].startDate);
    }

    @autobind
    @action
    onImportClick() {
        this.importClicked = true;
        internalclient.runTrialImportUsingGET({
            studyId: this.study.result!.studyId,
        });
        this.importButtonInfo = <p>{IMPORTING_TEXT}</p>;
    }

    @autobind
    @action
    onValidationClick() {
        this.validateClicked = true;
        internalclient.runTrialValidationUsingGET({
            studyId: this.study.result!.studyId,
        });
        this.validationButtonInfo = <p>{VALIDATING_TEXT}</p>;
    }

    @autobind
    @action
    onHelpClick() {
        window.location.search = 'help=1';
    }

    render() {
        if (this.displayHelp) {
            return <ImporterHelp />;
        }
        if (this.study.isPending) {
            return <div>Loading...</div>;
        }
        if (this.study.isError) {
            return <div>Error loading study</div>;
        }
        const study = this.study.result as ImportStudy;
        return (
            <div>
                <h1 style={{ textAlign: 'center', paddingTop: '20px' }}>
                    Import and Validation for {study.name}
                </h1>
                <div
                    style={{
                        width: '50%',
                        margin: '0 auto',
                        background: '#ededed',
                        borderRadius: '5px',
                        padding: '5px',
                    }}
                >
                    <b>
                        The following users have permission to view this study:{' '}
                    </b>
                    <p>{study.users.join(', ')}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={panelStyle}>
                        <p>
                            <b>Last successful validation: </b>
                            {this.lastValidation}
                        </p>
                        <p>
                            <button
                                disabled={this.validateClicked}
                                onClick={this.onValidationClick}
                                className="btn btn-primary"
                            >
                                {this.validationButtonText}
                            </button>
                            {this.validationButtonInfo}
                        </p>
                        <p>
                            <b>Validation logs:</b>
                            <p>
                                Below are logs of all validation attempts, both
                                manually triggered and automated nightly{}
                                runs. Successful validation will soon be
                                required to import studies, so it is important{}
                                to ensure your studies are passing validation.
                                You can manually trigger a validation run{}
                                at any time with the button below.
                            </p>
                            <table className="ui celled table unstackable">
                                <tr>
                                    <th>Start Date</th>
                                    <th></th>
                                    <th></th>
                                    <th>Triggered By</th>
                                    <th>Status</th>
                                </tr>
                                {this.validationLogs.isPending ? (
                                    <tr>
                                        <td>Loading...</td>
                                        <td></td>
                                    </tr>
                                ) : (
                                    this.renderLogs(
                                        this.validationLogs
                                            .result as ImportLog[]
                                    )
                                )}
                            </table>
                        </p>
                    </div>
                    <div style={panelStyle}>
                        <p>
                            <b>Last successful import to cBioPortal: </b>
                            {this.lastProdImport}
                        </p>
                        <p>
                            <b>Last successful test import: </b>
                            {this.lastTestImport}
                        </p>
                        <p>
                            <button
                                disabled={this.importClicked}
                                onClick={this.onImportClick}
                                className="btn btn-primary"
                            >
                                {this.importButtonText}
                            </button>
                            {this.importButtonInfo}
                        </p>
                        <p>
                            <b>Import logs:</b>
                            <p>
                                Below are logs of all attempted imports, both
                                manually triggered and automated nightly{}
                                runs. Manually triggered runs are tests to
                                confirm that import can successfully occur but{}
                                these test runs will not result in an updated
                                study in cBioPortal. Official imports occur{}
                                each night.
                            </p>
                            <table className="ui celled table unstackable">
                                <tr>
                                    <th>Start Date</th>
                                    <th></th>
                                    <th></th>
                                    <th>Triggered By</th>
                                    <th>Status</th>
                                </tr>
                                {this.importLogs.isPending ? (
                                    <tr>
                                        <td>Loading...</td>
                                        <td></td>
                                    </tr>
                                ) : (
                                    this.renderLogs(
                                        this.importLogs.result as ImportLog[]
                                    )
                                )}
                            </table>
                        </p>
                    </div>
                </div>
                <Link to="/importer">
                    <button
                        className="btn btn-primary btn-lg"
                        style={{
                            position: 'absolute',
                            left: 5,
                            top: 65,
                        }}
                    >
                        Back to Dashboard
                    </button>
                </Link>
                <button
                    className="btn btn-primary btn-lg"
                    style={{
                        position: 'absolute',
                        right: 5,
                        top: 65,
                    }}
                    onClick={this.onHelpClick}
                >
                    Help
                </button>
            </div>
        );
    }
}
