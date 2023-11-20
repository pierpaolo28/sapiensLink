from django.contrib import admin
from .models import List, Topic, Comment, User, Feedback, Vote, Report, EditSuggestion, EditComment, SavedList, Notification, RevokedToken

# Register your models here.

admin.site.register(List)
admin.site.register(Topic)
admin.site.register(Comment)
admin.site.register(Vote)
admin.site.register(Report)
admin.site.register(Feedback)
admin.site.register(EditSuggestion)
admin.site.register(EditComment)
admin.site.register(SavedList)
admin.site.register(Notification)
admin.site.register(RevokedToken)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
