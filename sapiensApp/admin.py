from django.contrib import admin
from .models import List, Topic, Comment, User, Feedback, Vote, Report

# Register your models here.

admin.site.register(List)
admin.site.register(Topic)
admin.site.register(Comment)
admin.site.register(Vote)
admin.site.register(Report)
admin.site.register(Feedback)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
