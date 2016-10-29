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
    stats: [],
    getToLastPage: function(err, res, fin) {
        ((next) => {
            let i = 0;
            res.forEach((r) => {
                this.parseStats(r, (err, s) => {
                    if (!err) {
                        this.stats.push(s);
                    }
                    if (++i >= res.length) {
                        next();
                    }
                });
            });
        })(() => {
            if (github.hasNextPage(res)) {
                github.getNextPage(res, {/*header*/}, (err, res) => {
                    this.getToLastPage(err, res, fin);
                });
            } else {
                fin(this.stats.sort((a, b) => a.number - b.number));
            }
        });
    },
    parseStats: function(r, cb) {
        let stats = r;
        stats.duration = r.merged_at
            ? new Date(r.merged_at) - new Date(r.created_at)
            : r.closed_at
                ? new Date(r.closed_at) - new Date(r.created_at)
                : "";

        github.pullRequests.get({
            owner: this.target.owner,
            repo: this.target.repo,
            number: r.number,
        }, (err, res) => {
            if (err) { return cb(err); }
            stats.createdBy = res.user.login;
            stats.mergedBy = res.merged_by ? res.merged_by.login : "";
            //stats.closedBy = res.closed_by.login;
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
            // Too many call API when get comments
            //commentsCount: "comment count",
        };
    },
    toTable: function(stats) {
        let header = this.getTableHeaderLabel();
        let headerLabels = Object.keys(header).map((k) => header[k]);

        let joinOptions = {
            seqOutsideSpace: true
        }

        // Output Header
        console.log(this._join(headerLabels, "|", joinOptions));
        stats.forEach((s) => {
            //s.commentsCount = s.comments ? s.comments.length : 0;
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

let main = (target) => {
    if (!target) { return "No added target object"; }
    pr.target = target;
    github.pullRequests.getAll(target, (err, res) => {
        pr.getToLastPage(err, res, (stats) => {
            output.toTable(stats);
        })
    });
}

exports.main = main;
