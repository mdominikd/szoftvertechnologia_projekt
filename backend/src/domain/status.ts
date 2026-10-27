//projekt allapotai

import { ProjectStatus } from "../generated/prisma/enums.js";


//megengedett valtasok
export const TRANSITIONS: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
    NEW: ['DRAFT'],
    DRAFT: ['WAIT','SCHEDULED'],
    WAIT: ['DRAFT','SCHEDULED'],
    SCHEDULED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED','FAILED'],
};

export const RESERVING_STATUSES: ProjectStatus[] = ['DRAFT', 'WAIT', 'SCHEDULED'];

//szerkeztheto allapotok

export const EDITABLE_STATUSES: ProjectStatus[] = ['NEW','DRAFT','WAIT'];

export function canTransition(from: ProjectStatus, to:ProjectStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false;
}

