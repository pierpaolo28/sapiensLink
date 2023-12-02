from django.contrib import admin
from .models import *

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
admin.site.register(RankTopic)
admin.site.register(Rank)
admin.site.register(RankVote)
admin.site.register(RankSaved)
admin.site.register(RankReport)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    pass
