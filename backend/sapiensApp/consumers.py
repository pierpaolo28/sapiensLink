import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Notification


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'notifications_group'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        pass

    async def send_notification(self, event):
        notification_message = event['notification']
        creator = event['creator_id']
        receiver = event['receiver_id']
        url = event['url']

        # Convert synchronous database operations to asynchronous
        await self.create_notification(notification_message, creator, receiver, url)

        await self.send(text_data=json.dumps({'notification': notification_message}))

    @sync_to_async
    def create_notification(self, notification_message, creator, receiver, url):
        Notification.objects.create(message=notification_message,
                                    creator=creator, receiver=receiver, url=url)
        
        