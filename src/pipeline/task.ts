export type TaskStatus = 'pending' | 'running' | 'retrying' | 'done' | 'error' | 'skipped';

export interface Task<TData = unknown> {
    id:       string;
    label:    string;
    status:   TaskStatus;
    data?:    TData;
    error?:   Error;
    subtasks: Task[];
    // display hints — renderers read these, workflows write them
    meta?:    string;
    right?:   string;
}

export type TaskPatch = Partial<Pick<Task, 'label' | 'status' | 'data' | 'error' | 'meta' | 'right'>>;
