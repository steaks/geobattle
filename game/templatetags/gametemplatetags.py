import os

from django import template
from django.conf import settings


register = template.Library()

@register.simple_tag
def sstatic(path):
    '''
    Returns absolute URL to static file with versioning.
    '''
    static_file_dirs = [settings.STATIC_ROOT] + settings.STATICFILES_DIRS
    for full_path in map(lambda d: os.path.join(d, path), static_file_dirs):
        if os.path.isfile(full_path):
            # Get file modification time.
            mtime = os.path.getmtime(full_path)
            return '%s%s?%s' % (settings.STATIC_URL, path, mtime)
    return '%s%s' % (settings.STATIC_URL, path)
