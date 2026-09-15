#!/usr/bin/env python3
"""Local dev server that mimics GitHub Pages: serves the repo root,
and answers missing paths with /404.html (status 404).
Usage: python3 tools/serve.py [port]"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            page = os.path.join(ROOT, '404.html')
            try:
                with open(page, 'rb') as f:
                    body = f.read()
                self.send_response(404)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return
            except OSError:
                pass
        super().send_error(code, message, explain)

    def log_message(self, *a):
        pass


if __name__ == '__main__':
    http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
