import _ from "lodash";
import sanitizeHtml from "sanitize-html";

// This sanitizer was written to be used on http requests / responses
// It can be extended to use on other JSON / JS objects, simply write a new method that calls sanitizeJson()
// To use in typescript, npm install -D @types/sanitize-html and modify the code to type the arguments

const sanitizeStr = (strValue, escapeJson) => {
    let jsonStr = strValue;
    if (escapeJson) {
        // Use JSON.stringify to escape JSON control characters
        jsonStr = JSON.stringify(jsonStr);
        // JSON.stringify will add double quotations at start and end of the string, need to remove
        jsonStr = jsonStr.substring(1, jsonStr.length - 1);
    }
    // check npmjs documentation on sanitize-html to see default list of allowedTags as well as other options available on sanitizeHtml
    // disallowedTagsMode is an option that controls how to handle detected html tags
    // It defaults to 'discard'. Other possible values are 'escape' and 'recursiveEscape'
    return sanitizeHtml(jsonStr, {allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ]});
};

const sanitizeJsonValue = (value, escapeJson) => {
    if (_.isPlainObject(value)) {
        return traverseObject(value, escapeJson);
    }
    if (_.isArray(value)) {
        return traverseArray(value, escapeJson);
    }
    if (_.isString(value)) {
        return sanitizeStr(value, escapeJson);
    }
    return value; // This will catch null, number, boolean, etc... - not necessarily valid value types in JSON, but are valid in JS Objects
};

const traverseObject = (object, escapeJson) => {
    const result = {};
    for (const [key, value] of Object.entries(object)) {
        _.set(result, sanitizeStr(key, escapeJson), sanitizeJsonValue(value, escapeJson));
    }
    return result;
};

const traverseArray = (array, escapeJson) => {
    return array.map((element) => sanitizeJsonValue(element, escapeJson));
};

export const sanitizeJson = (jsonObject, escapeJson) => {
    const sanitizedJson = traverseObject(jsonObject, escapeJson);
    return sanitizedJson;
};

export const sanitizeRequest = (request) => {
    if (!_.isNil(request.query)) {
        // On incoming HTTP requests, sanitize html and escape JSON control chars
        request.query = sanitizeJson(request.query, true);
    }
    if (!_.isNil(request.body)) {
        request.body = sanitizeJson(request.body, true);
    }
    return request;
};

export const sanitizeResponse = (response) => {
    if (!_.isNil(response.body)) {
        // On outgoing HTTP responses, sanitize html only (JSON control chars should already be escaped when the data was written)
        // This operates on assumption the response contents are already json escaped
        response.body = sanitizeJson(response.body, false);
    }
    return response;
};