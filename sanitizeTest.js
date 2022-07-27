import { sanitizeRequest, sanitizeResponse } from './sanitize.js';

// These can be converted to proper Jest tests, or whatever test framework is being used

// Test 1: It does not run when there is no query or body
console.log('Test 1: It does not run when there is no query or body')
const httpRequestContext = {
    req: {
        method: 'POST',
        query: {},
        url: 'http://test.com/api/test',
        body: {}
    }
};

const httpResponseContext = {
    res: {
        body: {}
    }
}

console.log('original: ', httpRequestContext)
console.log('sanitized: ', sanitizeRequest(httpRequestContext.req));
console.log('original: ', httpResponseContext)
console.log('sanitized: ', sanitizeResponse(httpResponseContext.res));

// Check to make sure sanitizeJson was not invoked (add it to import statement at top too)
// for example, Jest: expect(sanitizeJson).not.toHaveBeenCalled();

//Test 2: HTTP request sanitizes html and escapes Json
console.log('\nTest 2: HTTP request sanitizes html and escapes Json')
const httpRequest = {
    req: {
        method: 'POST',
        query: {test1: 1,
        'test2"\b\t\f\n\r\\': 'test json control chars in key',
        test3: {'test nested objects': 'json control chars " in value \b\t\f\n\r\\'},
        'test4&<>': [{'test object in array': 'string \b\t\f\n\r\\ 4'}, 42, '<script> everything after an open script tag is removed']   
        },
        url: 'http://test.com/api/test',
        body: {
            'test5<script>': 'script tag <script>myMaliciousScript.js</script> gets removed!',
            '<b>test6</b>': '<i>whitelisted tags will not be removed</i>',
            '<>test7<>': 'Loose html > symbols < are & encoded. <Tags that> </look like html> <;are removed> <^But these> <*$@are fine>'
        }
    }
};

console.log('original: ', console.dir(httpRequest, { depth: null }));
console.log('sanitized: ', console.dir(sanitizeRequest(httpRequest.req), { depth: null }));

//Test 3: HTTP response sanitizes html only
console.log('\nTest 3: HTTP response sanitizes html only')
const httpResponse = {
    res: {
        body: {
            value: 'response value > see that html <script>myMaliciousScript.js goes here</script> is sanitized but \\t\\n\\f json control chars are not'
        }
    }
}

console.log('original: ', httpResponse)
console.log('sanitized: ', sanitizeResponse(httpResponse.res));