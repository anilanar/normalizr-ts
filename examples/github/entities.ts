import { define } from "../../src";

interface User {
    id: number;
}

interface Label {
    id: number;
}

interface Milestone {
    id: number;
    creator: User;
}

interface Issue {
    id: number;
    assignees: User[];
    labels: Label[];
    milestone?: Milestone;
    user: User;
}

interface PullRequest {
    id: number;
    assignees: User[];
    labels: Label[];
    milestone?: Milestone;
    user: User;
}

export const user = define<User>()
    .id("id")
    .key("users");

export const label = define<Label>()
    .id("id")
    .key("labels");

export const milestone = define<Milestone>()
    .id("id")
    .key("milestones")
    .one("creator", user);

export const issue = define<Issue>()
    .id("id")
    .key("issues")
    .many("assignees", user)
    .many("labels", label)
    .one("milestone", milestone)
    .one("user", user);

export const pullRequest = define<PullRequest>()
    .id("id")
    .key("pullRequests")
    .many("assignees", user)
    .many("labels", label)
    .one("milestone", milestone)
    .one("user", user);

export const issueOrPullRequest = define<Issue | PullRequest>()
    .id("id")
    .union(
        {
            foo: issue,
            bar: pullRequest
        },
        entity => (entity.pull_request ? "pullRequests" : "issues")
    );
