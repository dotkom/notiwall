import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { findObjectPaths, getStringParams } from './utils';

it('Renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('Find object paths', () => {
  let obj = {
    a: {
      b: {
        c: 'first'
      },
      c: {
        c: 'second'
      }
    },
    b: {
      b: 1
    }
  };

  expect(findObjectPaths(obj, 'a.b.c')).toEqual([ 'a.b.c' ]);
  expect(findObjectPaths(obj, 'a.*.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.b')).toEqual([ 'a.b', 'b.b' ]);
  expect(findObjectPaths(obj, '*.*')).toEqual([ 'a.b', 'a.c', 'b.b' ]);
  expect(findObjectPaths(obj, '*.*.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.*.*')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, '*.*|a.b.c')).toEqual([ 'a.b', 'a.c', 'b.b', 'a.b.c' ]);
  expect(findObjectPaths(obj, 'a.b,c')).toEqual([ 'a.b', 'a.c' ]);
  expect(findObjectPaths(obj, 'a.b,c.c')).toEqual([ 'a.b.c', 'a.c.c' ]);
  expect(findObjectPaths(obj, 'a.b,c.d')).toEqual([]);
  expect(findObjectPaths(obj, '*.*|a.b,c.c')).toEqual([ 'a.b', 'a.c', 'b.b', 'a.b.c', 'a.c.c' ]);
});

it('Get string params', () => {
  expect(getStringParams('test{{one}}')).toEqual([ 'one' ]);
  expect(getStringParams('{{two}}test')).toEqual([ 'two' ]);
  expect(getStringParams('{{three}}test{{four}}')).toEqual([ 'three', 'four' ]);
  expect(getStringParams('{{five}}{{six}}')).toEqual([ 'five', 'six' ]);
  expect(getStringParams('test{{seven}}test{{eight}}test')).toEqual([ 'seven', 'eight' ]);
  expect(getStringParams('test{{nine}}{{ten}}')).toEqual([ 'nine', 'ten' ]);
});
