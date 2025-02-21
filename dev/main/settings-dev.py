from .settings import *  # noqa: F403

DEBUG = True
SECRET_KEY = "django-insecure-z17f%+pym+n*kucp$-x(es-t1a)437dz3h2y1t8601c=#-#=k1"

# Static assets.
WEBPACK_LOADER["DEFAULT"]["CACHE"] = False  # noqa: F405
