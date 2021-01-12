import * as React from 'react';
import { observer } from 'mobx-react';

@observer
export default class ImporterHelp extends React.Component<{}, {}> {
    onHelpClose() {
        window.location.search = '';
    }

    render() {
        return (
            <div
                style={{
                    height: '100%',
                    width: '50%',
                    margin: '5px auto',
                    borderRadius: '5px',
                    padding: '5px',
                    background: 'rgb(237, 237, 237)',
                }}
            >
                <h1 style={{ textAlign: 'center' }}>Help</h1>
                <p>
                    Welcome to the new importer. The importer has two major
                    pages: an overview page, and a details page.
                </p>
                <br />
                <p>
                    <h1 style={{ textAlign: 'center' }}>Overview Page</h1>
                    The overview page can be found{' '}
                    <a href="/cbioportal/importer">here</a>. It shows the
                    importer status of all the studies you have access to. Each
                    row in the table corresponds to a study in the cBioPortal.
                    If you click on a study in the table, you can go to the
                    study details page.
                </p>
                <br />
                <p>
                    <h1 style={{ textAlign: 'center' }}>Study Detail Page</h1>
                    The study detail page shows the details of a study according
                    to the importer. It{}
                    has three sections of information: study access, study
                    validation, and study import.
                </p>
                <p>
                    <h2>Access</h2>
                    The centered section near the top of the page shows what
                    people have access to this study. This list is taken from
                    the cBioPortal database, which is update every 15 minutes
                    with the latest list from dropbox.
                </p>
                <p>
                    <h2>Validation</h2>
                    Below and to the left of the access section is validation
                    information. This section shows all validation runs for this
                    study, and allows you to execute a validation run. To start
                    a run, you can press the Run Test Validation button. When
                    you do this and refresh the page, you will see a new log
                    entry with a status of validation pending- this is the run
                    you just started. Only one validation run can be executing
                    for each study at a time. When a run is finished, you can
                    view the results by clicking either the View HTML Report or
                    View Raw Log buttons. The HTML report is generally easier to
                    read, but we give you access to both reports just in case.
                </p>
                <p>
                    The importer accesses the files for your study on Dropbox
                    via a FUSE mount. Updates you make to dropbox persist fairly
                    quickly, but you may want to wait 30 seconds after making a
                    change to a dropbox file before running validation, just to
                    give those changes a fair chance to persist.
                </p>
                <p>
                    <h2>Import</h2>
                    Just like with the old importer, your study is updated every
                    night if the importer detects any changes to the related
                    files. These automated import logs show up in the import
                    logs section, which is located to the right of the
                    validation section. Similar to the validation section, the
                    import section shows all import runs, and allows you to run
                    a test import run. There is one critical difference - when
                    you run a test import, you are testing to make sure that the
                    import will work, but you are not doing an actual import.
                    You can use test imports to verify that your study will
                    import correctly, but you'll still have to wait overnight
                    for your study to update in the cBioPortal.
                </p>
                <button
                    className="btn btn-primary btn-lg"
                    style={{
                        position: 'absolute',
                        right: '25%',
                        top: 65,
                    }}
                    onClick={this.onHelpClose}
                >
                    Close
                </button>
            </div>
        );
    }
}
