var ASSERT = require("assert");

var VERSION = require("semver/version");

var testParseVersions = [
    ["1", [1]],
    ["1.0", [1, 0]],
    ["1.2", [1, 2]],
    ["1.2.3", [1, 2, 3]],
    ["1.2.3beta1", [1, 2, 3, "beta1"]]
];

var testInvalidVersions = [
    "",
    ".1",
    "1.",
    "asdf",
    "1.asdf",
    "1.1-asdf",
];

var testIncrementVersions = [
    ["1", 0, "2"],
    ["1", 1, "1.1"],
    ["1", 2, "1.0.1"],
    ["1", 3, "1.0.0.1"],
    ["1.1", 0, "2"],
    ["1.1", 1, "1.2"],
    ["1.1", 2, "1.1.1"],
    ["1.1", 3, "1.1.0.1"],
    ["1.1.1", 0, "2"],
    ["1.1.1", 1, "1.2"],
    ["1.1.1", 2, "1.1.2"],
    ["1.1.1", 3, "1.1.1.1"],
    ["1.1.1.1", 0, "2"],
    ["1.1.1.1", 1, "1.2"],
    ["1.1.1.1", 2, "1.1.2"],
    ["1.1.1.1", 3, "1.1.1.2"]
]

// -1 means v[0] is earlier than v[1]
var testCompareVersions = [
    ["1", "1", 0],
    ["1", "1.0", 0],
    ["1.0", "1.0", 0],
    ["1", "1.0.0", 0],
    ["1.0", "1.0.0", 0],
    ["1", "2", -1],
    ["1.0", "1.1", -1],
    ["1", "1.1", -1],
    ["1.0beta1", "1.0", -1],
    ["1.0beta1", "1.0beta2", -1],
    ["1.0beta1", "1.0.1beta1", -1],
    // ["1beta", "1.0beta", 0] // FIXME?
];

var testOrderedVersions = [
    "0.0.1alpha1",
    "0.0.1beta1",
    "0.0.1beta2",
    "0.0.1",
    "0.1beta",
    "0.1",
    "0.2beta",
    "0.2",
    "1alpha1",
    "1alpha2",
    "1beta1",
    "1",
    "1.0.1",
    "1.1alpha1",
    "1.1alpha2",
    "1.1beta1",
    "1.1beta2",
    "1.1",
    "1.1.1",
    "1.1.1",
    "1.2",
    "1.2.1",
    "2beta",
    "2",
    "2.0.1"
];

testParseVersions.forEach(function(v) {
    exports["test parseVersion " + v[0]] = function() {
        ASSERT.deepEqual(VERSION.parseVersion(v[0]), v[1]);
        ASSERT.deepEqual(VERSION.parseVersion(v[1]), v[1]);
    }
    exports["test stringifyVersion " + v[1]] = function() {
        ASSERT.equal(VERSION.stringifyVersion(v[1]), v[0]);
    }
});

testInvalidVersions.forEach(function(v) {
    exports["test parseVersion invalid " + v] = function() {
        ASSERT["throws"](function() { VERSION.parseVersion(v); }, "Invalid version string", "blah " + v);
    }
});

testIncrementVersions.forEach(function(v) {
    exports["test incrementVersion " + v[0] + " -> " + v[2]] = function() {
        ASSERT.equal(VERSION.compareVersions(
            VERSION.incrementVersion(VERSION.parseVersion(v[0]), v[1]),
            VERSION.parseVersion(v[2])
        ), 0);
    }
})

testCompareVersions.forEach(function(v) {
    exports["test compareVersions " + v[0] + " vs. " + v[1]] = function() {
        ASSERT.equal(VERSION.compareVersions(v[0], v[1]), v[2]);
    }
    exports["test compareVersions " + v[1] + " vs. " + v[0]] = function() {
        ASSERT.equal(VERSION.compareVersions(v[1], v[0]), -1 * v[2]);
    }
});

exports["test sort with compareVersions"] = function() {
    for (var i = 0; i < 5; i++) {
        // copy and randomize
        var array = testOrderedVersions.slice();
        array.sort(function() { return Math.random() - 0.5; });

        array.sort(VERSION.compareVersions);

        ASSERT.deepEqual(array, testOrderedVersions);
    }
}

if (module === require.main)
    require("os").exit(require("test").run(exports));
