import Pusher from 'pusher-js';

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_ID as string, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
});

export default pusher;
