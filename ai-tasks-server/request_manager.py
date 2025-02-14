from fastapi import Request
import asyncio
import atexit

def unique_hash():
    return 'hash2'
    import uuid
    import hashlib
    
    # Generate a unique UUID
    unique_id = str(uuid.uuid4())
    
    # Create SHA-256 hash of the UUID
    hash_obj = hashlib.sha256(unique_id.encode())
    hash_str = hash_obj.hexdigest()
    
    return hash_str

class RequestLogger:
    _active_loggers = set()

    def __init__(self, request_obj: Request):
        """
        Initialize request logger with FastAPI request object.
        
        Args:
            request_obj: FastAPI request object
        """
        self.request = request_obj
        self._stream_queue = []
        self._is_streaming = True
        RequestLogger._active_loggers.add(self)

    def log(self, type_name, data):
        """
        Add data to the response stream.
        
        Args:
            type_name (str): Type of data being streamed
            data: Content to stream
        """
        self._stream_queue.append({
            'type': type_name,
            'data': data
        })

    async def create_stream(self):
        """
        Create async stream that yields new data as it arrives.
        
        Yields:
            dict: Stream of data entries as they are logged
        """
        while self._is_streaming or self._stream_queue:
            if self._stream_queue:
                yield self._stream_queue.pop(0)
            await asyncio.sleep(0.1)  # Prevent busy waiting

    def close_stream(self):
        """
        Mark the stream as complete and remove from active loggers.
        """
        self._is_streaming = False
        RequestLogger._active_loggers.discard(self)

    @classmethod
    def close_all_streams(cls):
        """
        Close all active request logger streams.
        """
        for logger in cls._active_loggers.copy():
            logger.close_stream()

def init_request_logger(request):
    """
    Initialize a new RequestLogger instance.
    
    Args:
        request: FastAPI request object
    
    Returns:
        RequestLogger: New logger instance for the request
    """
    return RequestLogger(request)

# Register close_all_streams to run on program exit
atexit.register(RequestLogger.close_all_streams)
