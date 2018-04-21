import React, { Component } from 'react';
import Style from 'style-it';
import './Template.css';

class Template extends Component {
  constructor() {
    super();

    this.updateProp = this.updateProp.bind(this);
    this.apiInput = this.apiInput.bind(this);
  }

  updateProp(prop, value) {
    this.props.updateComponent(this.props.index, prop, value);
  }

  apiInput(apis) {
    let apiElements = Object.keys(apis).map((api, i) => {
      let [apiName, path] = api.split(':');
      let apiKey = () => `${apiName}:${path}`;
      let onChange = () => {
        console.log(apiKey())
        //this.updateProp(apiKey, )
      }
      let apiListOptions = this.props.apiList.map((e, i) => (
        <option key={i} value={e}>{e}</option>
      ));
      let apiNameElement = (
        <select defaultValue={apiName} onChange={onChange}>
          {apiListOptions}
        </select>
      );
      let pathElement = (
        <input defaultValue={path} onChange={onChange} />
      );

      return (
        <div key={i}>
          {apis[api]} = {apiNameElement}:{pathElement}
        </div>
      );
    });

    return (
      <div>{apiElements}</div>
    );
  }

  getTemplateTypes(props, prop) {
    if ('templateVars' in props && prop in props.templateVars) {
      return props.templateVars[prop];
    }

    switch (prop) {
      case 'css': return 'css';
      case 'size': return 'size';
      default: return 'string';
    }
  }

  render() {
    let props = Object.assign({}, this.props.props);

    props.className = `${this.props.className || ''} Template ${props.className || ''}`;

    let modularCSS = ' ';
    if ('css' in this.props) {
      modularCSS = this.props.css;
    }

    let content = this.props.children;
    if (this.props.edit) {
      let newContent = Object.entries(this.props)
        .filter(entry => (
          [
            'children',
            'className',
            'edit',
            'props',
            'index',
            'updateComponent',
          ].indexOf(entry[0]) === -1
          && entry[0] in (this.props.templateVars || {})
        ) || /^(css|size)$/.test(entry[0])
        )
        .map((entry, i) => {
          let inputElement = null
          switch (this.getTemplateTypes(this.props, entry[0])) {
            case 'apis':
              inputElement = this.apiInput(entry[1]);
              break;

            case 'css': // In the future: Make user also able to choose theme from a list
              inputElement = (
                <textarea
                  defaultValue={entry[1] || ''}
                  onChange={evt => this.updateProp(entry[0], evt.target.value)}
                  rows={4}
                  cols={40}
                />
              );
              break;

            case 'size':
              inputElement = (
                <select
                  defaultValue={entry[1] || 1}
                  onChange={evt => this.updateProp(entry[0], evt.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="full">full width</option>
                </select>
              );
              break;

            default:
              inputElement = (
                <input
                  type="text"
                  defaultValue={entry[1] || ''}
                  onChange={evt => this.updateProp(entry[0], evt.target.value)}
                />
              );
              break;
          }

          return (
            <React.Fragment key={i}>
              <div key={i}>{entry[0]}</div>
              {inputElement}
            </React.Fragment>
          );
        });

      content = (
        <React.Fragment>
          <h2>{this.props.template}</h2>
          {newContent}
        </React.Fragment>
      );
    }

    let controlElement = null;
    if (this.props.apis) {
      controlElement = Object.keys(this.props.apis)
        .map(api => api.split(':')[0])
        .filter(api => this.props.offline.indexOf(api.split('.')[0]) !== -1)
        .map((api, i) => (
          <button onClick={() => this.props.goOnline(api)} key={i} title={api}>Start API</button>
        ));
    }

    return (
      <Style>
        {modularCSS}
        <div {...props} style={this.props.style}>
          {content}
          {controlElement}
        </div>
      </Style>
    );
  }
}

export default Template;
