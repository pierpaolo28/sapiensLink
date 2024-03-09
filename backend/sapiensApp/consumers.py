import json
from channels.generic.websocket import AsyncWebsocketConsumer


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

        await self.send(text_data=json.dumps({'message': notification_message, 'creator_id': creator, 
                                              'receiver_id': receiver, 'url': url}))
        