import { entity, one, many, pipe, union, contramap } from "../../src2";

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

export interface Issue {
    id: number;
    assignees: User[];
    labels: Label[];
    milestone?: Milestone;
    user: User;
    pull_request: false;
}

export interface PullRequest {
    id: number;
    assignees: User[];
    labels: Label[];
    milestone?: Milestone;
    user: User;
    pull_request: true;
}

export const user = entity("users", (u: User) => u.id);

export const label = entity("labels", (l: Label) => l.id);

export const milestone = pipe(
    entity("milestones", (m: Milestone) => m.id),
    one("creator", user)
);

export const issue = pipe(
    entity("issues", (i: Issue) => i.id),
    many("assignees", user),
    many("labels", label),
    one("milestone", milestone),
    one("user", user)
);

export const pullRequest = pipe(
    entity("pullRequests", (p: PullRequest) => p.id),
    many("assignees", user),
    many("labels", label),
    one("milestone", milestone),
    one("user", user)
);

export const issueOrPullRequest = pipe(
    issue,
    union(pullRequest, (a): a is PullRequest => a.pull_request)
);
