/** Role-based UI and capability checks (mirror logic in firestore.rules). */

export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    RECRUITER: 'recruiter',
    VIEWER: 'viewer'
};

export function isManagerUp(role) {
    return role === ROLES.ADMIN || role === ROLES.MANAGER;
}

export function isWriter(role) {
    return role === ROLES.ADMIN || role === ROLES.MANAGER || role === ROLES.RECRUITER;
}

export function canReadOwnedDoc(role, doc, uid) {
    if (!doc || !uid) return false;
    if (isManagerUp(role) || role === ROLES.VIEWER) return true;
    if (doc.ownerId === uid) return true;
    const assigned = doc.assignedTo;
    return Array.isArray(assigned) && assigned.includes(uid);
}

export function canWriteOwnedDoc(role, doc, uid) {
    if (!doc || !uid) return false;
    if (isManagerUp(role)) return true;
    if (!isWriter(role)) return false;
    if (doc.ownerId === uid) return true;
    const assigned = doc.assignedTo;
    return Array.isArray(assigned) && assigned.includes(uid);
}

/** Shared collections: companies, jobs, masters, templates — manager+ can edit */
export function canEditSharedData(role) {
    return isManagerUp(role);
}

export function canManageUsers(role) {
    return role === ROLES.ADMIN;
}

export function canViewAudit(role) {
    return isManagerUp(role);
}

export function can(action, role, context = {}) {
    switch (action) {
        case 'manage_users':
            return canManageUsers(role);
        case 'edit_shared':
            return canEditSharedData(role);
        case 'write_pipeline':
            return isWriter(role);
        case 'read_all_pipeline':
            return isManagerUp(role) || role === ROLES.VIEWER;
        case 'view_audit':
            return canViewAudit(role);
        default:
            return false;
    }
}
