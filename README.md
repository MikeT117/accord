Accord is a clone of the fundamental functionality of Discord this includes

    Servers
        - Voice channels
        - Text Channels
        - Channel categories
            - Children of categories can either have their roles synced or not
        - Role based access to channels
            - Including specific actions such at pinning messages, attaching images etc.
        - Server Invite system
        - Server Ban System
    Real-time chat (Websockets)
        - Includes Emojis
        - Attachments (Handled via Cloudinary using a custom hook)
            - Attachments are first signed by the backend then directly uploaded to Cloudinary
        - Pinning/Unpinning messages
        - Deleting & Editing messages
        - Admin based access edit messages
    Real-time voice (WebRTC)
        - Channels can be restricted using roles
        - Users can be muted, user can self mute, join and leave a channel
    Friend system
        - Friend requests can be sent to other users
        - Users can be blocked
        - Friends are listed when creating invites with the ability to directly send invites to servers during their creation
    Discoevry system
        - Servers can be set as discoverable, if set as such users will be able to join without an invite
    User Proivacy System
        - Users may allow direct messages from server members without being friends
        - Users can be messaged directly from a users profile within server

All real time activities are enabled via websockets, events are dispatched via the rest server to a NATs server, websocket instances consume specific message queues and listen for specific events, the payloads for these events are pushed to clients based on either the provided user ids or the provided role ids, base server events e.g. channel updates (renaming, adding/removing roles) and server updates such as new roles, server properties etc. are sent only to the default role for the server which means all users that are members of that specific server recieve these events.

To build, run:

- build_docker_images.sh

To run, copy .env.example to .env, fill out the blank values and run:

- compose_up.sh

The app will now be live and can be accessed at the host provided in the .env.
