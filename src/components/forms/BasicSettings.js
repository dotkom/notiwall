import React, { Component } from 'react';
import { Section } from '../layout';
import './Settings.css';

class BasicSettings extends Component {
  chooseOrganizationHandler(evt) {
    console.log(evt.target.value)
  }

  chooseOrganization(org) {
    //this.props.updateApi();
  }

  render() {
    let { apis, translate } = Object.assign({}, this.props);

    const options = Object.keys(apis.affiliation.org).map((k, i) => {
      return <option key={i}>{translate(k)}</option>
    });

    return (
      <Section column size="full" fillheight>
        <div className="settings-container">
          <div className="settings-header">
            <h1 className="settings-title">Alternativer</h1>
            <span className="settings-close" onClick={this.props.onClick}></span>
          </div>
          <div className="settings-section">
          <div className="settings-field">
              <span className="settings-field-name">
                Linjeforening
              </span>
              <div className="settings-field-form">
                <select onChange={this.chooseOrganizationHandler}>
                  {options}
                </select>
              </div>
            </div>
            <div className="settings-field">
              <span className="settings-field-name">
                Velg hva som vises
              </span>
              <div className="settings-field-form full-width">

                <div className="settings-field-form-checkbox">
                  <input type="checkbox" id="buss" />
                  <label htmlFor="buss">Buss</label>
                  <select>
                    <option>Valg</option>
                  </select>
                </div>

                <div className="settings-field-form-checkbox">
                  <input type="checkbox" id="kaffe" />
                  <label htmlFor="kaffe">Kaffe</label>
                  <select>
                    <option>Valg</option>
                  </select>
                </div>

              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }
}

export default BasicSettings;
