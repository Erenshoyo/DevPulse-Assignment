export interface IIssue {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

export interface IReporter {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface IIssue_Reporter extends Omit<IIssue, "reporter_id"> {
  reporter: IReporter;
}

export interface ICreateIssue {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface IUpdateIssue {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}

export interface IQueryIssue {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
}
