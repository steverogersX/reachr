import { EventEmitter } from 'events';
import type { Task, TaskPatch } from './task';

export class TaskStore extends EventEmitter {
    private roots: Task[] = [];
    private index: Map<string, Task> = new Map();

    // --- write ---

    add(task: Omit<Task, 'subtasks'>, parentId?: string): Task {
        const node: Task = { ...task, subtasks: [] };

        this.index.set(node.id, node);

        if (parentId !== undefined) {
            const parent = this.require(parentId);
            parent.subtasks.push(node);
        } else {
            this.roots.push(node);
        }

        this.emit('change', this.roots);
        return node;
    }

    update(id: string, patch: TaskPatch): void {
        const task = this.require(id);
        Object.assign(task, patch);
        this.emit('change', this.roots);
    }

    // --- read ---

    getTasks(): Task[] {
        return this.roots;
    }

    // --- typed event overloads ---

    on(event: 'change', listener: (tasks: Task[]) => void): this {
        return super.on(event, listener);
    }

    off(event: 'change', listener: (tasks: Task[]) => void): this {
        return super.off(event, listener);
    }

    once(event: 'change', listener: (tasks: Task[]) => void): this {
        return super.once(event, listener);
    }

    emit(event: 'change', tasks: Task[]): boolean {
        return super.emit(event, tasks);
    }

    // --- internal ---

    private require(id: string): Task {
        const task = this.index.get(id);
        if (!task) throw new Error(`Task not found: ${id}`);
        return task;
    }
}
