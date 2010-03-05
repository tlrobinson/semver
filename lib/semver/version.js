var UTIL = require("util");

exports.incrementVersion = function(version, field, special) {
    version = version.slice(); // copy

    // fill missing preceding components with zeros
    for (var i = version.length; i < field; i++)
        version[i] = 0;

    // inc or set the version number
    if (typeof version[field] !== "number")
        version[field] = 1;
    else
        version[field] += 1;

    // trim trailing fields, except for the second field
    if (field == 0) {
        version[1] = 0;
        version = version.slice(0, 2);
    } else {
        version = version.slice(0, field + 1);
    }
    
    if (special)
        version.push(special);

    return version;
}

exports.stringifyVersion = function(version) {
    if (typeof version === "string")
        return version;

    var last = version[version.length-1];
    if (typeof last === "string")
        return version.slice(0, -1).join(".") + last;

    return version.join(".");
}

exports.parseVersion = function(version) {
    if (Array.isArray(version))
        return version.slice(); // copy
    if (typeof version === "string") {
        if (/^(\d+\.)*(\d+([A-Za-z][0-9A-Za-z-]*)?)$/.test(version)) {
            // 1) digits followed by a period, end of the version string, or a "special" version suffix
            // 2) "special" version suffix
            var components = version.match(/\d+(?=\.|$|[A-Za-z][0-9A-Za-z-]*$)|[A-Za-z][0-9A-Za-z-]*$/g);
            return components.map(function(component, i) {
                var v = parseInt(component);
                if (isNaN(v) && i === components.length-1)
                    return component;
                else
                    return v;
            });
        }
    }
    throw "Invalid version string: " + version;
}

exports.compareVersions = function(a, b) {
    // if passed an array it will return a copy
    a = exports.parseVersion(a);
    b = exports.parseVersion(b);

    // HACK: by inserting -1 before the special version suffix we make it sort
    // in the correct order. I think.
    if (typeof a[a.length-1] === "string")
        a.splice(a.length-1, 0, -1);
    if (typeof b[b.length-1] === "string")
        b.splice(b.length-1, 0, -1);

    while (a.length < b.length)
        a.push(0);
    while (b.length < a.length)
        b.push(0);

    return UTIL.compare(a, b);
}
