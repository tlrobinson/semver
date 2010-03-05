var FILE = require("file");
var OS = require("os");
var SYSTEM = require("system");

var stream = require("term").stream;

var Package = require("semver/package").Package;

exports.init = function(jake, options) {
    options = options || {};
    options.gitRemotes = options.gitRemotes || ["origin"];
    options.gitBranch = options.gitBranch || "master";
    
    var pkg = new Package(options);
    
    jake = jake || require("jake");

    jake.task("semver:inc:major", function() { pkg.incrementVersion(0); });
    jake.task("semver:inc:minor", function() { pkg.incrementVersion(1); });
    jake.task("semver:inc:patch", function() { pkg.incrementVersion(2); });
    jake.task("semver:inc:build", function() { pkg.incrementVersion(3); });

    // TODO: other version control
    jake.task("package:push:major", ["semver:inc:major", "package:git:commit-version", "package:git:push", "semver:git:tag"]);
    jake.task("package:push:minor", ["semver:inc:minor", "package:git:commit-version", "package:git:push", "semver:git:tag"]);
    jake.task("package:push:patch", ["semver:inc:patch", "package:git:commit-version", "package:git:push", "semver:git:tag"]);
    jake.task("package:push:build", ["semver:inc:build", "package:git:commit-version", "package:git:push"]);

    jake.task("semver:git:tag", function() {
        var version = pkg.getVersionString();
        var tagName = pkg.getVCSTag();

        systemCommand(["git", "tag", tagName]);

        options.gitRemotes.forEach(function(remote) {
            systemCommand(["git", "push", remote, "tag", tagName]);
        });
    });

    jake.task("package:git:commit-version", function() {
        var version = pkg.getVersionString();
        var message = "Version " + version + " at " + (new Date());
    
        if (SYSTEM.env.amend === "yes")
            systemCommand(["git", "commit", "--amend", pkg.packageFile(), "-C", "HEAD"]);
        else
            systemCommand(["git", "commit", pkg.packageFile(), "-m", message]);
    });

    jake.task("package:git:push", function() {
        options.gitRemotes.forEach(function(gitRemote) {
            systemCommand(["git", "push", gitRemote, options.gitBranch]);    
        });
    });
}

function systemCommand(cmd) {
    stream.print("\0blue(==>\0) " + cmd.join(" "));
    if (OS.system(cmd) !== 0)
        throw '"'+cmd.join(" ")+'" failed.';
}
