"""Start from any working directory, with Windows SDK subprocess support."""
import asyncio
import sys
from pathlib import Path

import uvicorn

sys.path.insert(0, str(Path(__file__).resolve().parent))

if __name__ == '__main__':
    from app.config import Settings
    settings = Settings()
    loop_factory = asyncio.ProactorEventLoop if sys.platform == 'win32' else asyncio.new_event_loop
    server = uvicorn.Server(uvicorn.Config('app.main:app', host=settings.api_host, port=settings.api_port, loop='none', proxy_headers=False))
    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(server.serve())
