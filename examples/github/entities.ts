import { entity, one, many, pipe } from "../../src2";

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

export const issueOrPullRequest = define<Issue | PullRequest>()
    .id("id")
    .union(
        {
            foo: issue,
            bar: pullRequest
        },
        entity => (entity.pull_request ? "pullRequests" : "issues")
    );
