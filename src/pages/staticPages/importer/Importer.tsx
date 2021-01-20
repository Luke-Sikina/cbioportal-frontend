import * as React from 'react';
import { Link } from 'react-router-dom';
import autobind from 'autobind-decorator';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';

import internalclient from 'shared/api/cbioportalInternalClientInstance';
import { ImportStudy } from 'cbioportal-ts-api-client';
import { remoteData } from 'cbioportal-frontend-commons';

import { dateOrNever, parseUrlParams } from './importerUtil';
import ImporterHelp from './ImporterHelp';

const panelStyle = {
    width: '50%',
    margin: '20px auto',
    borderRadius: '5px',
    padding: '5px',
    background: '#ededed',
};

@observer
export default class Importer extends React.Component<{}, {}> {
    @observable
    private displayHelp: boolean = !!parseUrlParams().help;

    constructor(_: {}) {
        super(_);
        console.log('howdy');
    }

    @observable
    private studies = remoteData<ImportStudy[]>({
        await: () => [],
        invoke: async () => {
            return internalclient.getAllImporterStudiesUsingGET({});
        },
    });

    @autobind
    @action
    onHelpClick() {
        window.location.search = 'help=1';
    }

    renderStudy(study: ImportStudy): JSX.Element {
        return (
            <tr className={study.imported ? 'positive' : 'negative'}>
                <Link to={`/import/${study.studyId}`} id={study.name}>
                    <span>{study.name}</span>
                </Link>
                <td>{dateOrNever(study.validationDate)}</td>
                <td>{dateOrNever(study.importDate)}</td>
                <td>{study.imported ? 'Up to Date' : 'Out of Date'}</td>
            </tr>
        );
    }

    renderStudies(studies: ImportStudy[]): JSX.Element[] {
        return studies.map(s => this.renderStudy(s));
    }

    public render() {
        if (this.displayHelp) {
            return <ImporterHelp />;
        }

        if (this.studies.isPending) {
            return <div>Loading...</div>;
        }

        if (this.studies.isError) {
            return <div>Error loading study.</div>;
        }

        return (
            <div style={panelStyle}>
                <h1>cBioPortal Importer Dashboard</h1>
                <p>
                    This dashboard allows you to view validation and import logs
                    for studies that you have access to.{}
                    You can also validate and test import of newly updated data.
                    Note that importing using this dashboard{}
                    is a test import only and will not result in an updated
                    study in cBioPortal.{}
                    Official imports occur each night.
                </p>
                <p>
                    Successful validation will soon be required to import
                    studies, so it is important to ensure your{}
                    studies are passing validation.
                </p>
                <table
                    className="ui celled table unstackable"
                    style={{ width: '100%' }}
                >
                    <thead>
                        <tr>
                            <th>Study</th>
                            <th>Last Successful Validation</th>
                            <th>Last Successful Import</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderStudies(
                            this.studies.result as ImportStudy[]
                        )}
                    </tbody>
                </table>
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
