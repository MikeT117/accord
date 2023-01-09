export type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
};

export type GithubValidateTokenResponse = {
  id: number;
  url: string;
  app: {
    name: string;
    url: string;
    client_id: string;
  };
  user: GitHubUser;
  token: string;
  hashed_token: string;
  token_last_eight: string;
  note: null;
  note_url: null;
  created_at: string;
  updated_at: string;
  scopes: string[];
  fingerprint: null;
};

export type GithubEmailResponse = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'private' | 'public' | null;
};
