// bot-engine/ErrorHandler.js
class ErrorHandler {
  static meetingErrors = {
    'ZOOM_MEETING_NOT_STARTED': {
      retry: true,
      delay: 300000, // 5 minutes
      notifyUser: true,
      message: 'Meeting has not started yet. Will retry in 5 minutes.'
    },
    'INVALID_PASSWORD': {
      retry: false,
      notifyUser: true,
      message: 'The provided password was incorrect.'
    },
    'NETWORK_ERROR': {
      retry: true,
      delay: 60000, // 1 minute
      notifyUser: false,
      message: 'Network issues detected. Retrying...'
    }
  };

  static handle(error, meeting) {
    const errorType = this.determineErrorType(error);
    const handler = this.meetingErrors[errorType] || this.meetingErrors.DEFAULT;

    const response = {
      ...handler,
      originalError: error.message,
      meetingId: meeting._id,
      timestamp: new Date()
    };

    if (handler.retry) {
      response.retryAt = new Date(Date.now() + handler.delay);
    }

    return response;
  }

  static determineErrorType(error) {
    if (error.message.includes('not started')) return 'ZOOM_MEETING_NOT_STARTED';
    if (error.message.includes('password')) return 'INVALID_PASSWORD';
    if (error.message.includes('network') || error.message.includes('ECONN')) return 'NETWORK_ERROR';
    return 'UNKNOWN_ERROR';
  }
}