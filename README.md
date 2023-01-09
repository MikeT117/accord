# Accord

Accord is a semi clone of the most basic functionality of Discord, this includes

- Servers
  - Voice channels
  - Text Channels
  - Channel categories
    - Children of categories can either have their roles synced or not
  - Role based access to channels
    - Including specific actions such at pinning messages, attaching images etc.
  - Server Invite system
- Real-time chat
  - Includes Emoji
  - Attachments (Handled via Cloudinary using a custom hook)
    - Attachments are first signed by the backend then directly uploaded to Cloudinary
  - Pinning/Unpinning messages
  - Deleting & Editing messages
- Real-time voice (Mediasoup - WebRTC)
  - Channels can be restricted using roles
  - Users can be muted, user can self mute, join and leave a channel
- Friend system
  - Friend requests can be sent to other users
  - Users can be blocked
  - Friends are listed when creating invites with the ability to directly send invites to servers during their creation

All real time activities are enabled via websockets, events are dispatched via the rest server to a RabbitMQ server, websocket instances consume specific message queues and listen for specific events, the payloads for these events are pushed to clients based on either the provided user ids or the provided role ids, base server events e.g. channel updates (renaming, adding/removing roles) and server updates such as new roles, server properties etc. are sent only to the default role for the server which means all users recieve these events.
