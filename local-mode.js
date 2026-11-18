(() => {
  const localOnly = () => Promise.reject(new Error('Questa versione non usa account né archivio foto online.'));
  globalThis.CloudRegistro = Object.freeze({
    currentUserId: () => null,
    currentUserEmail: () => '',
    currentWorkerUrl: () => '',
    isPlatformMaster: () => false,
    restoreSession: async () => null,
    consumeAuthLink: async () => null,
    memberships: async () => [],
    listPhotos: async () => [],
    signIn: localOnly,
    signOut: async () => {},
    configureWorker: localOnly,
    fetchPhoto: localOnly,
    deletePhoto: localOnly,
    uploadPhoto: localOnly,
    syncWorkspace: localOnly,
    loadWorkspaceForMembership: localOnly,
    deleteOwnReport: localOnly,
    createWorkspace: localOnly,
    listWorkspaces: localOnly,
    listMembers: localOnly,
    inviteMember: localOnly,
    updateMember: localOnly,
    requestPasswordReset: localOnly,
    completeInvite: localOnly
  });
})();