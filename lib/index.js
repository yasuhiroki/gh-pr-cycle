'use strict';

let GitHubApi = require("github");
let github = new GitHubApi({
    // optional args
    protocol: "https",
    followRedirects: false,
    timeout: 5000
});

let pr = {
    target: {},
    statsList: [],
    getToLastPage: function(res, fin) {
        ((next) => {
            let i = 0;
            res.forEach((r) => {
                this.parseStats(r, (err, s) => {
                    if (err) { return fin(err); }
                    this.statsList.push(s);
                    if (++i >= res.length) {
                        next();
                    }
                });
            });
        })(() => {
            if (github.hasNextPage(res)) {
                github.getNextPage(res, {/*header*/}, (err, res) => {
                    if (err) { return fin(err); }
                    this.getToLastPage(res, fin);
                });
            } else {
                fin(this.statsList.sort((a, b) => a.number - b.number));
            }
        });
    },
    parseStats: function(r, cb) {
        let stats = r;
        github.pullRequests.get({
            owner: this.target.owner,
            repo: this.target.repo,
            number: r.number,
        }, (err, res) => {
            if (err) { return cb(err); }
            stats._single = res;
            cb(null, stats);
        });
    },
};

let output = {
    getTableHeaderLabel: function() {
        return {
            number: "number",
            state: "state",
            createdBy: "created by",
            created_at: "created at",
            mergedBy: "merged by",
            merged_at: "merged at",
            duration: "duration(msec)",
            changed_files: "changed files",
            code_difference: "code difference",
            // Too many call API when get comments
            //commentsCount: "comment count",
        };
    },
    toTable: function(statsList) {
        let header = this.getTableHeaderLabel();
        let headerLabels = Object.keys(header).map((k) => header[k]);

        let joinOptions = {
            seqOutsideSpace: true
        }

        // Output Header
        console.log(this._join(headerLabels, "|", joinOptions));
        statsList.forEach((s) => {
            s.createdBy = s._single.user.login;
            s.mergedBy = s._single.merged_by
                ? s._single.merged_by.login
                : "";
            //s.closedBy = res.closed_by.login;
            s.duration = s.merged_at
                ? new Date(s.merged_at) - new Date(s.created_at)
                : s.closed_at
                    ? new Date(s.closed_at) - new Date(s.created_at)
                    : "";
            s.changed_files = s._single.changed_files;
            s.code_difference = s._single.additions - s._single.deletions;;
            let values = Object.keys(header).map((k) => s[k]);
            console.log(this._join(values, "|", joinOptions));
        })
    },
    _join: function(arr, sep, options) {
        options = options || {};
        let seqOutsideSpace = options.seqOutsideSpace ? " " : "";
        return sep +
                seqOutsideSpace +
                arr.join(`${seqOutsideSpace}${sep}${seqOutsideSpace}`) +
                seqOutsideSpace +
                sep;
    }
}

let main = (target, auth) => {
    if (!target) { return "No added target object"; }
    pr.target = target;
    if (auth.type) { github.authenticate(auth); }
    github.pullRequests.getAll(target, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        if (res.length === 0) {
            console.log("Don't found pull requests");
            return;
        }
        pr.getToLastPage(res, (statsList) => {
            if (err) {
                console.log(err);
                return;
            }
            output.toTable(statsList);
        })
    });
}

exports.main = main;
