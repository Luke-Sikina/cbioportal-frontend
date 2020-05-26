import * as React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import {remoteData} from "../../../public-lib/api/remoteData";
import autobind from 'autobind-decorator';
import ImportStudyComponent from './ImporterStudy';
import { dateOrNever, parseUrlParams } from './importerUtil';
import {
    default as CBioPortalAPIInternal, ImportStudy
} from "shared/api/generated/CBioPortalAPIInternal";
import internalClient from "../../../shared/api/cbioportalInternalClientInstance";
import { Link } from 'react-router';
import ImporterHelp from './ImporterHelp';

const panelStyle = {
    width: "50%",
    margin: "20px auto",
    borderRadius: "5px",
    padding: "5px",
    background: "#ededed",
}

@observer
export default class Importer extends React.Component<{}, {}> {
    @observable
    private displayHelp: boolean = !!parseUrlParams().help;
    
    constructor(_: {}) {
        super(_);
        this.internalClient = internalClient;
    }

    public internalClient: CBioPortalAPIInternal;

    @observable
    private studies = remoteData<ImportStudy[]>({
        await: () =>  [],
        invoke: async () => {
            return internalClient.getAllImporterStudiesUsingGET({})
        } 
    })

    @autobind
    @action
    onHelpClick() {
        window.location.search = "help=1";
    }

    renderStudy(study: ImportStudy): JSX.Element {
        return <tr className={study.imported ? "positive" : "negative"}>
            <Link to={`/import/${study.studyId}`}>
                <span>{study.name}</span>
            </Link>
            <td>
                {dateOrNever(study.validationDate)}
            </td>
            <td>
                {dateOrNever(study.importDate)}
            </td>
            <td>
                {study.imported ? "Up to Date" : "Out of Date"}
            </td>
        </tr>
    }

    renderStudies(studies: ImportStudy[]): JSX.Element[] {
        return studies.map(s => this.renderStudy(s))
    }

    public render() {
        if (this.displayHelp) {
            return <ImporterHelp/>
        }
        
        if (this.studies.isPending) {
            return <div>
                Loading...
            </div>
        }

        return <div style={panelStyle}>
            <h1>cBioPortal Importer Dashboard</h1>
            <p>
                This dashboard allows you to view validation and import logs for studies that you have access to.{ }
                You can also validate and test import of newly updated data. Note that importing using this dashboard{ }
                is a test import only and will not result in an updated study in cBioPortal.{ }
                Official imports occur each night.
            </p>
            <p>
                Successful validation will soon be required to import studies, so it is important to ensure your{ }
                studies are passing validation.
            </p>
            <table className="ui celled table unstackable" style={{width: "100%"}}>
                <thead>
                    <tr>
                        <th>Study</th>
                        <th>Last Successful Validation</th>
                        <th>Last Successful Import</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {this.renderStudies(this.studies.result as ImportStudy[])}
                </tbody>
            </table>
            <button
                className="btn btn-primary btn-lg"
                style={{
                    position: "absolute",
                    right: 5,
                    top: 65,
                }}
                onClick={this.onHelpClick}
            >
                Help
            </button>
        </div>
    }
}