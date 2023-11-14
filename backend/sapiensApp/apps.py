from django.apps import AppConfig


class SapiensappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'sapiensApp'

    def ready(self):
        import sapiensApp.signals
