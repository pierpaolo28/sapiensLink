from django.contrib import admin
from .models import List, Topic, Comment, User, Vote

# Register your models here.

# admin.site.register(User)
admin.site.register(List)
admin.site.register(Topic)
admin.site.register(Comment)
admin.site.register(Vote)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
