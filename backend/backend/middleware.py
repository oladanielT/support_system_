import json
import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Custom middleware to handle errors and provide better error responses
    """
    
    def process_exception(self, request, exception):
        """
        Handle unhandled exceptions and return JSON error responses
        """
        if request.path.startswith('/api/'):
            logger.error(f"API Error: {str(exception)}", exc_info=True)
            
            return JsonResponse({
                'error': 'An internal server error occurred',
                'message': str(exception) if settings.DEBUG else 'Please try again later',
                'status_code': 500
            }, status=500)
        
        return None