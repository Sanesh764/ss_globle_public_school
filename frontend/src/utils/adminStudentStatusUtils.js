export const getStudentStatusActionConfig = (isActive) => {
  if (typeof isActive !== 'boolean') {
    return null;
  }

  if (isActive) {
    return {
      actionType: 'deactivate',
      nextIsActive: false,
      buttonLabel: 'Deactivate Student',
      dialogTitle: 'Deactivate Student Record',
      confirmLabel: 'Confirm Deactivation',
      processingLabel: 'Deactivating...',
      message:
        'Deactivating this student will exclude them from future active-student attendance selections. The permanent student record and its existing information will remain preserved and will not be deleted.',
      successFallback: 'Student deactivated successfully.',
    };
  }

  return {
    actionType: 'activate',
    nextIsActive: true,
    buttonLabel: 'Activate Student',
    dialogTitle: 'Activate Student Record',
    confirmLabel: 'Confirm Activation',
    processingLabel: 'Activating...',
    message:
      'Activating this student will make them eligible to appear in future active-student attendance selections.',
    successFallback: 'Student activated successfully.',
  };
};

export const getStudentStatusErrorDetails = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (status === 400) {
    return {
      status: 400,
      shouldRefresh: false,
      message: apiMsg || 'Invalid status update request.',
    };
  }

  if (status === 401 || status === 403) {
    return {
      status,
      shouldRefresh: false,
      message: 'You are not authorized to change this student’s status.',
    };
  }

  if (status === 404) {
    return {
      status: 404,
      shouldRefresh: true,
      message: 'This student record no longer exists.',
    };
  }

  if (status === 409) {
    return {
      status: 409,
      shouldRefresh: true,
      message:
        apiMsg ||
        'A conflict occurred while updating the student status. Refreshing latest details.',
    };
  }

  return {
    status: status || 500,
    shouldRefresh: false,
    message: apiMsg || 'Failed to update student status. Please try again.',
  };
};
