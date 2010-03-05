var FILE = require("file");

var VERSION = require("./version");

var Package = exports.Package = function(options) {
    this._packageRoot = options.packageRoot || FILE.cwd();
    this._packageFile = options.packageFile || "package.json";
}

Package.prototype.packageFile = function() {
    return this._packageFile;
}

// 1) reads and parses package.json into an object
// 2) passes object to callback
// 3) serializes (possibly modified) object back to package.json
Package.prototype.configure = function(callback) {
    var path = FILE.path(this.packageFile);
    if (!path.isFile())
        throw "Package metadata file at " + path + " does not exist.";

    var pkg = JSON.parse(path.read({ charset : "UTF-8" }));

    var result = callback.call(this, pkg);

    path.write(JSON.stringify(pkg, null, 4), { charset : "UTF-8" });

    return result;
}

Package.prototype.setVersion = function(version) {
    this.configure(function(pkg) {
        pkg.version = VERSION.stringifyVersion(version);
    });
}

Package.prototype.getVersion = function() {
    return this.configure(function(pkg) {
        return VERSION.parseVersion(pkg.version);
    });
}

Package.prototype.getVersionString = function() {
    return VERSION.stringifyVersion(this.getVersion());
}

Package.prototype.getVCSTag = function() {
    return "v" + this.getVersionString();
}

Package.prototype.incrementVersion = function(field, special) {
    this.configure(function(pkg) {
        var version = VERSION.parseVersion(pkg.version);
        
        version = VERSION.incrementVersion(version, field, special);

        print("Old version: " + pkg.version);
        pkg.version = VERSION.stringifyVersion(version);
        print("New version: " + pkg.version);
    });
}
