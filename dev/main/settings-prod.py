import os

from .settings import *  # noqa: F403

DEBUG = False
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# Static assets.
STATIC_ROOT = BASE_DIR / "build"  # noqa: F405
WEBPACK_LOADER["DEFAULT"]["CACHE"] = True  # noqa: F405

# Security.
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 518400
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_PRELOAD = True
