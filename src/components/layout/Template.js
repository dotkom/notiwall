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
      return <div key={i}>{api}</div>
    })

    return (
      <div>{apiElements}</div>
    )
  }

  getTemplateTypes(props, prop) {
    if ('templateVars' in props && prop in props.templateVars) {
      return props.templateVars[prop];
    }

    switch (prop) {
      case 'css': return 'css';
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
        ) || entry[0] === 'css'
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

    return (
      <Style>
        {modularCSS}
        <div {...props}>
          {content}
        </div>
      </Style>
    );
  }
}

export default Template;
