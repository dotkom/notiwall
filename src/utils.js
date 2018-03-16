/**
 * This file is intended to create useful and testable functions for the project.
 */
import { get, has } from 'object-path';

/**
 * List all matching object paths by using a simple string.
 * 
 * Example:
 * findObjectPaths({ a: { b: { c: 'first' }, c: { c: 'second' } } }, 'a.*.c')
 * Should output: [ 'a.b.c', 'a.c.c' ]
 */
export const findObjectPaths = (object, schema = '') => {
    let keys = schema.split('.');
    let results = [[]];

    for (let key of keys) {
        let newResults = [];

        if (key === '*') {
            for (let index in results) {
                let branches = [];
                let path = results[index];

                if (has(object, path)) {
                    for (let next in get(object, path)) {
                        newResults.push(path.concat(next));
                    }
                }
            }
        } else {
            for (let index in results) {
                let path = results[index].concat([key]);

                if (has(object, path)) {
                    newResults.push(path);
                }
            }
        }

        results = newResults;
    }

    return results.map(result => result.join('.'));
}
