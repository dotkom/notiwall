import React, { Component } from 'react';
import { Template } from '../layout';
import './Vakter.css';
import { isAfter, isBefore } from 'date-fns';
import { get } from 'object-path';

class Vakter extends Component {
  constructor() {
    super();

    this.state = {
      message: 'Emil',
      responsible: true,
      servants: [
        {
          summary: 'Emil Karoline',
          start: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T09:00:00.000Z',
            pretty: '11:00',
          },
          end: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T10:00:00.000Z',
            pretty: '12:00',
          },
          pretty: '11:00-12:00',
        },
        {
          summary: 'Karoline Emil',
          start: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T10:00:00.000Z',
            pretty: '12:00',
          },
          end: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T11:00:00.000Z',
            pretty: '13:00',
          },
          pretty: '12:00-13:00',
        },
        {
          summary: 'Sjokolade',
          start: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T11:00:00.000Z',
            pretty: '13:00',
          },
          end: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T12:00:00.000Z',
            pretty: '14:00',
          },
          pretty: '13:00-14:00',
        },
        {
          summary: 'Kake',
          start: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T12:00:00.000Z',
            pretty: '14:00',
          },
          end: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T13:00:00.000Z',
            pretty: '15:00',
          },
          pretty: '14:00-15:00',
        },
        {
          summary: 'Doge',
          start: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T13:00:00.000Z',
            pretty: '15:00',
          },
          end: {
            timeZone: 'Europe/Oslo',
            date: '2018-04-07T14:00:00.000Z',
            pretty: '16:00',
          },
          pretty: '15:00-16:00',
        },
      ],
    };

    this.templateVars = {};
  }

  componentWillReceiveProps(nextProps) {
    if (true) {
      let message = get(nextProps, 'message');
      let responsible = get(nextProps, 'responsible');
      let servants = get(nextProps, 'servants');

      let state = Object.assign({}, this.state, {
        message,
        responsible,
        servants,
      });

      this.setState(state);
    }
  }

  render() {
    let responsibleListElement = null;
    if (this.state.responsible && this.state.servants.length) {
      responsibleListElement = this.state.servants.map((e, i) => {
        let style = {
          opacity: 0.5,
        };

        let arrow = '';

        if (
          isAfter(new Date(), e.start.date) &&
          isBefore(new Date(), e.end.date)
        ) {
          style = {
            color: '#fff',
          };

          arrow = '->';
        }

        return (
          <div style={style} key={i}>
            {arrow} {e.pretty} - {e.summary}
          </div>
        );
      });
    } else {
      responsibleListElement = (
        <div style={{ fontStyle: 'italic' }}>- Ingen ansvarlige nå</div>
      );
    }

    let spaceAroundSVG = 40;
    let skewSVG = (
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: `calc(100% - ${spaceAroundSVG * 2}px)`,
          position: 'absolute',
          marginLeft: -16,
        }}
      >
        <path fill="rgba(0, 0, 0, .2)" d="M0,0 90,0 60,100 0,100" />
      </svg>
    );

    let props = Object.assign({}, this.props);
    props.style = Object.assign({}, this.props.style || {}, {
      padding: `${spaceAroundSVG}px 16px`,
      boxSizing: 'border-box',
    });

    return (
      <Template className={this.constructor.name} {...props}>
        <h1>Onlinekontoret</h1>
        <h3>Kontorvakter</h3>
        {responsibleListElement}
      </Template>
    );
  }
}

export default Vakter;
