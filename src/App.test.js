import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { findObjectPaths } from './utils';

it('Renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});

it('Finds object paths', () => {
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
});
