import * as React from 'react';
import { ImportLog } from 'cbioportal-ts-api-client';
import internalClient from '../../../shared/api/cbioportalInternalClientInstance';
import { MobxPromiseUnionType } from 'mobxpromise';
import { remoteData } from 'cbioportal-frontend-commons';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link } from 'react-router';
import { dateOrNever } from './importerUtil';

type LogDisplayProps = {
    routeParams: {
        logType: string;
        studyId: string;
        logId: string;
    };
    location: {
        query: {
            raw: string;
        };
    };
};

const divStyle = {
    width: '50rem',
    minWidth: '800px',
    margin: '0 auto',
};

@observer
export default class LogDisplay extends React.Component<LogDisplayProps, {}> {
    @observable
    private log: MobxPromiseUnionType<ImportLog>;

    constructor(props: LogDisplayProps) {
        super(props);
        console.log(this.props);

        this.log = remoteData<ImportLog>({
            await: () => [],
            invoke: async () => {
                return internalClient.getLogUsingGET({
                    logType: this.props.routeParams.logType,
                    studyId: this.props.routeParams.studyId,
                    id: this.props.routeParams.logId,
                });
            },
        });
    }

    renderLog(log: ImportLog): JSX.Element {
        if (this.props.location.query.raw === 'false') {
            return <p dangerouslySetInnerHTML={{ __html: log.text }} />;
        }
        if (!log.rawText) {
            return <span />;
        }
        const lines = log.rawText.split('\n').map((line, i) => (
            <span key={i}>
                {line}
                <br />
            </span>
        ));
        return <div>{lines}</div>;
    }

    render() {
        if (this.log.isPending) {
            return <div style={divStyle}>Loading log...</div>;
        }
        if (this.log.isError) {
            return (
                <div style={divStyle}>
                    Error retrieving log: {this.log.result}
                </div>
            );
        }
        const logFile = this.log.result as ImportLog;
        return (
            <div style={divStyle}>
                <Link to={`/import/${logFile.studyId}`}>
                    <button
                        className="btn btn-primary btn-lg"
                        style={{
                            position: 'absolute',
                            left: 5,
                            top: 65,
                        }}
                    >
                        Back to Study
                    </button>
                </Link>
                <h1>
                    {logFile.logType === 'import' ? 'Import ' : 'Validation '}{' '}
                    log {logFile.id}
                </h1>
                <p>
                    <b>Study Id: </b>
                    {logFile.studyId}
                </p>
                <p>
                    <b>Test Run: </b>
                    {logFile.testRun ? 'Yes' : 'No'}
                </p>
                <p>
                    <b>Run Started: </b>
                    {dateOrNever(logFile.startDate)}
                </p>
                <p>
                    <b>Log contents:</b>
                </p>
                {this.renderLog(logFile)}
            </div>
        );
    }
}
